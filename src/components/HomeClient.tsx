"use client";

import { useToolSearch } from "@/hooks/useToolSearch";

// ... existing imports

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
    isPending,
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

  // Flatten pages
  const tools = useMemo(() => {
    const allTools = data?.pages.flatMap((page) => page.data) || [];
    // Deduplicate tools by ID to prevent "Encountered two children with the same key" error
    const uniqueTools = Array.from(
      new Map(allTools.map((tool) => [tool.id, tool])).values()
    );
    return uniqueTools;
  }, [data]);

  // --- Client-side Search Logic ---
  // Hook up Fuse.js for instant filtering on loaded tools
  const { query: searchQuery, setQuery: setSearchQuery, results: filteredTools } = useToolSearch({
    tools,
    keys: ['name', 'description', 'tags', 'category_label'],
    threshold: 0.3
  });

  // Sync search query from URL if it changes (e.g. initial load or back button)
  useEffect(() => {
    // Only sync if local state is empty (prevent overwriting typing)
    if (!searchQuery && activeSearch) {
        setSearchQuery(activeSearch);
    }
  }, [activeSearch]);

  const showSkeleton = isPending;

  return (
    <div className="min-h-screen bg-[#0a0a12]">
      <Header />
      <Hero 
        totalTools={totalCount} 
        onSearchChange={setSearchQuery} 
        searchValue={searchQuery}
      />

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        
        {/* Mobile Category Filter (Visible only on mobile) */}
        <MobileCategoryFilter />

        {/* Only show Featured if we are on "home" (no search/category) AND no instant search */}
        {activeCategory === "all" && !activeSearch && !searchQuery && (
           <Featured tools={featuredTools} />
        )}

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Tool list */}
          <div className="min-w-0 flex-1">
            {showSkeleton ? (
              <ToolListSkeleton />
            ) : (
              <ToolList tools={filteredTools} />
            )}
            
            {/* Loading Indicator / Sentinel */}
            {/* Only show loading sentinel if we are NOT searching locally (or if we want to search across all pages?) */}
            {/* For now, infinite scroll + client search is tricky. 
                If searching, we only search loaded tools. 
                To fix this properly, we'd need to fetch ALL tools for client search. 
                But for "Instant Feedback", this is a good first step. 
            */}
            {!showSkeleton && !searchQuery && (
              <div ref={ref} className="py-8 flex justify-center w-full">
                {isFetchingNextPage ? (
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                ) : hasNextPage ? (
                   <div className="h-4 w-full" />
                ) : (
                  <span className="text-white/20 text-sm py-4">No more tools found</span>
                )}
              </div>
            )}
            
            {/* Empty State for Search */}
            {searchQuery && filteredTools.length === 0 && (
                <div className="py-12 text-center text-white/40">
                    <p className="text-lg">No tools found for "{searchQuery}"</p>
                    <p className="text-sm mt-2">Try adjusting your search or clear filters</p>
                </div>
            )}
          </div>

          {/* Sidebar (Hidden on mobile, visible on desktop) */}
          <div className="hidden w-full shrink-0 lg:block lg:w-80">
            <Sidebar />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
