import { Suspense } from "react";
import HomeClient from "@/components/HomeClient";
import { getTools, getFeaturedTools, getCategoryCounts, getToolCount } from "@/lib/queries";
import { categories } from "@/data/categories";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const q_param = sp.q;
  const q = Array.isArray(q_param) ? q_param[0] : q_param || "";

  // Determine initial filter based on Q
  const isCategory = categories.some((c) => c.id === q);
  const initialCategory = isCategory ? q : "all";
  const initialSearch = isCategory ? "" : q;

  const [tools, featuredTools, categoryCounts, totalCount] = await Promise.all([
    getTools({ category: initialCategory, search: initialSearch }),
    getFeaturedTools(3),
    getCategoryCounts(),
    getToolCount(),
  ]);

  return (
    <Suspense>
      <HomeClient
        initialTools={tools}
        featuredTools={featuredTools}
        categoryCounts={categoryCounts}
        totalCount={totalCount}
        initialCategory={initialCategory}
        initialSearch={initialSearch}
      />
    </Suspense>
  );
}
