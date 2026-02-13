import { MetadataRoute } from "next";
import { categories } from "@/data/categories";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pickaihub.com";
  const supabase = await createClient();

  // 1. Static Routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  // 2. Category Routes
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/category/${category.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 3. Tool Routes (Dynamic)
  // Fetch all tool IDs (limited to latest 10000 for performance)
  // We use try-catch to ensure sitemap doesn't crash if DB is down
  let toolRoutes: MetadataRoute.Sitemap = [];
  
  try {
    const { data: tools } = await supabase
      .from("tools")
      .select("id, launch_date, logo")
      .order("launch_date", { ascending: false })
      .limit(10000);

    toolRoutes = (tools || []).map((tool) => ({
      url: `${baseUrl}/tool/${tool.id}`,
      lastModified: new Date(tool.launch_date || new Date()),
      changeFrequency: "monthly",
      priority: 0.6,
      // Add image to sitemap for Google Images indexing
      images: tool.logo && tool.logo.startsWith("http") ? [tool.logo] : undefined,
    }));
  } catch (error) {
    console.error("Failed to fetch tools for sitemap:", error);
    // Continue with static routes even if DB fails
  }

  return [...routes, ...categoryRoutes, ...toolRoutes];
}