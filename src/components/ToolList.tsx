"use client";

import { useState } from "react";
import { Tool } from "@/lib/types";
import ToolCard from "./ToolCard";

interface ToolListProps {
  tools: Tool[];
}

type SortType = "recommended" | "newest" | "popular";

export default function ToolList({ tools }: ToolListProps) {
  const [sortBy, setSortBy] = useState<SortType>("recommended");

  const sortedTools = [...tools].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.launch_date).getTime() - new Date(a.launch_date).getTime();
    }
    if (sortBy === "popular") {
      return b.rating - a.rating;
    }
    // recommended: trending first, then by rating
    const aScore = (a.is_trending ? 10 : 0) + a.rating;
    const bScore = (b.is_trending ? 10 : 0) + b.rating;
    return bScore - aScore;
  });

  const sortOptions: { value: SortType; label: string }[] = [
    { value: "recommended", label: "Recommended" },
    { value: "newest", label: "Newest" },
    { value: "popular", label: "Popular" },
  ];

  return (
    <div>
      {/* Sort buttons */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/40">Sort by:</span>
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                sortBy === opt.value
                  ? "bg-violet-500/15 text-violet-400"
                  : "text-white/40 hover:bg-white/5 hover:text-white/60"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <span className="text-sm text-white/30">{tools.length} Tools</span>
      </div>

      {/* Tool cards */}
      <div className="flex flex-col gap-4">
        {sortedTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {/* Load more */}
      {tools.length > 0 && (
        <div className="mt-8 text-center">
          <button className="rounded-xl border border-white/10 bg-white/[0.03] px-8 py-3 text-sm font-medium text-white/50 transition-all duration-200 hover:border-violet-500/30 hover:bg-violet-500/5 hover:text-violet-400">
            Load More
          </button>
        </div>
      )}

      {tools.length === 0 && (
        <div className="py-20 text-center">
          <div className="mb-4 text-5xl">🔍</div>
          <h3 className="mb-2 text-lg font-medium text-white/60">No tools found</h3>
          <p className="text-sm text-white/30">Please try different keywords or categories.</p>
        </div>
      )}
    </div>
  );
}
