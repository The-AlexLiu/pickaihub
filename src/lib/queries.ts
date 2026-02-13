import { createClient } from "./supabase/server";
import { supabase as supabaseClient } from "./supabase";
import { Tool, CategoryCount } from "./types";

/**
 * Fetch tools with optional filtering and sorting.
 * Runs server-side in Next.js Server Components.
 */
export async function getTools(
  options?: {
    category?: string;
    search?: string;
    sort?: "recommended" | "newest" | "popular";
  },
  page = 1,
  pageSize = 20
): Promise<Tool[]> {
  const supabase = await createClient();
  let query = supabase.from("tools").select("*");

  // Category filter
  if (options?.category && options.category !== "all") {
    query = query.eq("category", options.category);
  }

  // Search filter (name or description)
  if (options?.search) {
    // Sanitize search input to prevent PostgREST syntax injection
    // Remove special characters that have meaning in PostgREST URL syntax
    const sanitized = options.search.replace(/[(),.]/g, " ");
    query = query.or(
      `name.ilike.%${sanitized}%,description.ilike.%${sanitized}%`
    );
  }

  // Sorting
  const sort = options?.sort || "recommended";
  if (sort === "newest") {
    query = query.order("launch_date", { ascending: false });
  } else if (sort === "popular") {
    query = query.order("rating", { ascending: false });
  } else {
    // recommended: trending first, then by rating
    query = query
      .order("is_trending", { ascending: false })
      .order("rating", { ascending: false });
  }

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching tools:", error);
    return [];
  }

  return (data as Tool[]) || [];
}

/**
 * Fetch a single tool by ID.
 * Supports both UUID (default) and Name (fallback if UUID invalid).
 */
export async function getTool(idOrName: string): Promise<Tool | null> {
  const supabase = await createClient();
  
  // 1. Check if it's a valid UUID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrName);

  let query = supabase.from("tools").select("*");

  if (isUuid) {
    query = query.eq("id", idOrName);
  } else {
    // 2. If not UUID, try to find by name (case insensitive)
    // Decode URI component in case it's encoded (e.g. "Tool%20Name")
    const name = decodeURIComponent(idOrName);
    query = query.ilike("name", name);
  }

  const { data, error } = await query.single();

  if (error) {
    // Only log if it's not a "row not found" error, to reduce noise for 404s
    if (error.code !== 'PGRST116') {
        console.error(`Error fetching tool (${idOrName}):`, error);
    }
    return null;
  }

  return data as Tool;
}

/**
 * Fetch trending/featured tools.
 */
export async function getFeaturedTools(limit = 3): Promise<Tool[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tools")
    .select("*")
    .eq("is_trending", true)
    .order("rating", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching featured tools:", error);
    return [];
  }

  return (data as Tool[]) || [];
}

/**
 * Fetch related tools (same category, excluding current tool).
 */
export async function getRelatedTools(
  category: string,
  excludeId: string,
  limit = 3
): Promise<Tool[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tools")
    .select("*")
    .eq("category", category)
    .neq("id", excludeId)
    .order("rating", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching related tools:", error);
    return [];
  }

  return (data as Tool[]) || [];
}

/**
 * Fetch tool count per category for the sidebar/tabs.
 * Optimized to use Database RPC if available, falls back to client-side counting.
 */
export async function getCategoryCounts(): Promise<CategoryCount[]> {
  // 1. Try to use efficient Database RPC
  const supabase = await createClient();
  const { data: rpcData, error: rpcError } = await supabase.rpc("get_category_counts");

  if (!rpcError && rpcData) {
    return rpcData as CategoryCount[];
  }

  // 2. Fallback: Fetch all categories and count in JS (Legacy method)
  // Useful if the RPC function hasn't been created yet.
  if (rpcError) {
    console.warn(
      "Optimization warning: 'get_category_counts' RPC function not found or failed. Falling back to slow client-side counting. Please run migrations/create_get_category_counts.sql in your Supabase SQL Editor."
    );
  }

  const { data, error } = await supabase
    .from("tools")
    .select("category");

  if (error) {
    console.error("Error fetching category counts:", error);
    return [];
  }

  const counts: Record<string, number> = {};
  (data || []).forEach((row: { category: string }) => {
    counts[row.category] = (counts[row.category] || 0) + 1;
  });

  return Object.entries(counts).map(([category, count]) => ({
    category,
    count,
  }));
}

/**
 * Get total tool count.
 */
export async function getToolCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("tools")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error fetching tool count:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Fetch user's favorite tool IDs.
 * Used for prefetching data in Server Components.
 */
export async function getUserFavoriteIds(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("favorites")
    .select("tool_id")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }

  return data.map((row) => row.tool_id);
}
