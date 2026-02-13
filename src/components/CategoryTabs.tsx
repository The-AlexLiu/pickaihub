"use client";

import { categories } from "@/data/categories";
import { CategoryCount } from "@/lib/types";

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  categoryCounts: CategoryCount[];
}

export default function CategoryTabs({
  activeCategory,
  onCategoryChange,
  categoryCounts,
}: CategoryTabsProps) {
  return (
    <div className="border-b border-white/10 bg-[#0a0a12]/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 -mb-px flex gap-1 overflow-x-auto py-3">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count =
              cat.id === "all"
                ? categoryCounts.reduce((sum, cc) => sum + cc.count, 0)
                : categoryCounts.find((cc) => cc.category === cat.id)?.count || 0;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-violet-600/20 to-cyan-500/20 text-white shadow-sm shadow-violet-500/10"
                    : "text-white/50 hover:bg-white/5 hover:text-white/80"
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    isActive
                      ? "bg-violet-500/20 text-violet-300"
                      : "bg-white/5 text-white/30"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
