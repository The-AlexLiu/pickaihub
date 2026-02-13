import { supabase } from "./supabase";
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
  let query = supabase.from("tools").select("*");

  // Category filter
  if (options?.category && options.category !== "all") {
    query = query.eq("category", options.category);
  }

  // Search filter (name or description)
  if (options?.search) {
    query = query.or(
      `name.ilike.%${options.search}%,description.ilike.%${options.search}%`
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
 */
export async function getTool(id: string): Promise<Tool | null> {
  const { data, error } = await supabase
    .from("tools")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching tool:", error);
    return null;
  }

  return data as Tool;
}

/**
 * Fetch trending/featured tools.
 */
export async function getFeaturedTools(limit = 3): Promise<Tool[]> {
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
 */
export async function getCategoryCounts(): Promise<CategoryCount[]> {
  // Supabase doesn't support GROUP BY directly, so we fetch all categories
  // and count in JS. With ~150 tools this is very efficient.
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
  const { count, error } = await supabase
    .from("tools")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error fetching tool count:", error);
    return 0;
  }

  return count || 0;
}
