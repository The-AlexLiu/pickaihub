"use client";

import { Tool } from "@/lib/types";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  const { isFavorited, addFavorite, removeFavorite } = useFavorites();
  const { user } = useAuth();
  const router = useRouter();
  const favorited = isFavorited(tool.id);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push("/signup");
      return;
    }

    if (favorited) {
      removeFavorite.mutate(tool.id);
    } else {
      addFavorite.mutate(tool.id);
    }
  };

  const pricingColors: Record<string, string> = {
    free: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    freemium: "border-violet-500/30 bg-violet-500/10 text-violet-400",
    paid: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  };

  return (
    <div className="group relative rounded-xl border border-white/[0.06] bg-[#12121f]/80 p-5 transition-all duration-300 hover:border-violet-500/30 hover:bg-[#16162a]/80 hover:shadow-lg hover:shadow-violet-500/5">
      {/* Badges */}
      <div className="absolute right-4 top-4 flex gap-2">
        {tool.is_new && (
          <span className="rounded-md bg-cyan-500/15 px-2 py-0.5 text-xs font-medium text-cyan-400">
            New
          </span>
        )}
        {tool.is_trending && (
          <span className="rounded-md bg-orange-500/15 px-2 py-0.5 text-xs font-medium text-orange-400">
            🔥 Hot
          </span>
        )}
      </div>

      <div className="flex gap-4">
        {/* Logo - Clickable */}
        <Link href={`/tool/${tool.id}`} className="shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/5 text-2xl shadow-inner transition-transform duration-200 group-hover:scale-110 overflow-hidden">
            {tool.logo && tool.logo.startsWith("http") ? (
              <img src={tool.logo} alt={tool.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xl">🤖</span>
            )}
          </div>
        </Link>

        <div className="min-w-0 flex-1">
          {/* Title + Category */}
          <div className="mb-1 flex items-center justify-between">
             <div className="flex items-center gap-2 min-w-0">
                <Link href={`/tool/${tool.id}`} className="truncate">
                  <h3 className="truncate text-base font-semibold text-white transition-colors duration-200 group-hover:text-violet-300">
                    {tool.name}
                  </h3>
                </Link>
                <span className="shrink-0 rounded-md bg-white/5 px-2 py-0.5 text-xs text-white/40">
                  {tool.category_label}
                </span>
             </div>
             
             {/* Favorite Button */}
             <button
               onClick={toggleFavorite}
               className={`ml-2 -mr-2 rounded-full p-2 transition-colors hover:bg-white/10 ${
                 favorited ? "text-rose-500" : "text-white/20 hover:text-white/60"
               }`}
             >
               <Heart className={`h-4 w-4 ${favorited ? "fill-current" : ""}`} />
             </button>
          </div>

          {/* Description */}
          <Link href={`/tool/${tool.id}`}>
            <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-white/45 transition-colors group-hover:text-white/60">
              {tool.description}
            </p>
          </Link>

          {/* Tags */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {tool.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-xs text-white/35"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Visits */}
              <div className="flex items-center gap-1.5 text-xs text-white/30">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {tool.visits}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 text-xs text-amber-400/70">
                <svg className="h-3.5 w-3.5 fill-amber-400/70" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.603 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {tool.rating}
              </div>

              {/* Pricing */}
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${pricingColors[tool.pricing]}`}>
                {tool.pricing_label}
              </span>
            </div>

            {/* Visit button */}
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/70 transition-all duration-200 hover:bg-gradient-to-r hover:from-violet-600 hover:to-cyan-500 hover:text-white hover:shadow-lg hover:shadow-violet-500/25"
            >
              Visit →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
