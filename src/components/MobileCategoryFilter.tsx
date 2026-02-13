"use client";

import { categories } from "@/data/categories";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";

export default function MobileCategoryFilter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const isCategoryPage = pathname.startsWith("/category/");
  const categorySlug = isCategoryPage ? pathname.split("/category/")[1] : "all";
  const queryCategory = searchParams.get("category");
  const activeCategory = isCategoryPage ? categorySlug : (queryCategory || "all");

  return (
    <div className="mb-8 flex overflow-x-auto pb-4 scrollbar-hide lg:hidden">
      <div className="flex gap-2">
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          const href = category.id === "all" ? "/" : `/category/${category.id}`;
          
          return (
            <Link
              key={category.id}
              href={href}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? "border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-500/25"
                  : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
