"use client";

import { useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery, QueryFunctionContext } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ToolList from "@/components/ToolList";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Featured from "@/components/Featured";
import { Tool, CategoryCount } from "@/lib/types";
import { categories } from "@/data/categories";

interface HomeClientProps {
  initialTools: Tool[];
  featuredTools: Tool[];
  categoryCounts: CategoryCount[];
  totalCount: number;
  initialCategory: string;
  initialSearch: string;
}

interface ToolsResponse {
  data: Tool[];
  nextPage: number | null;
}

// Fetcher function
const fetchTools = async ({
  pageParam = 1,
  queryKey,
}: QueryFunctionContext): Promise<ToolsResponse> => {
  const [_, search, category] = queryKey as [string, string, string];
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (category && category !== "all") params.set("category", category);
  params.set("page", String(pageParam));
  params.set("limit", "20");

  const res = await fetch(`/api/tools?${params.toString()}`);
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
};

export default function HomeClient({
  initialTools,
  featuredTools,
  categoryCounts,
  totalCount,
  initialCategory,
  initialSearch,
}: HomeClientProps) {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";

  // Determine current filter state from URL (same logic as server)
  const isCategory = categories.some((c) => c.id === q);
  const activeCategory = isCategory ? q : "all";
  const activeSearch = isCategory ? "" : q;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery<ToolsResponse>({
    queryKey: ["tools", activeSearch, activeCategory],
    queryFn: fetchTools,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialData: {
      pages: [{ data: initialTools, nextPage: initialTools.length === 20 ? 2 : null }],
      pageParams: [1],
    },
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  // Flatten pages
  const tools = useMemo(
    () => data?.pages.flatMap((page) => page.data) || [],
    [data]
  );
  
  return (
    <div className="min-h-screen bg-[#0a0a12]">
      <Header />
      <Hero totalTools={totalCount} />

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        
        {/* Only show Featured if we are on "home" (no search/category) */}
        {activeCategory === "all" && !activeSearch && (
           <Featured tools={featuredTools} />
        )}

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Tool list */}
          <div className="min-w-0 flex-1">
            <ToolList tools={tools} />
            
            {/* Loading Indicator / Sentinel */}
            <div ref={ref} className="py-8 flex justify-center w-full">
              {isFetchingNextPage ? (
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
              ) : hasNextPage ? (
                 <div className="h-4 w-full" />
              ) : (
                <span className="text-white/20 text-sm py-4">No more tools found</span>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full shrink-0 lg:w-80">
            <Sidebar />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
