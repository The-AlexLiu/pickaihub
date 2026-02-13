"use client";

import { Tool } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { Heart, Sparkles, ExternalLink, Flame, Star } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MouseEvent } from "react";

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  const { isFavorited, addFavorite, removeFavorite } = useFavorites();
  const { user } = useAuth();
  const router = useRouter();
  const favorited = isFavorited(tool.id);

  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    let { left, top } = currentTarget.getBoundingClientRect();

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

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
    free: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    freemium: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    paid: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      onMouseMove={handleMouseMove}
      className="group relative flex flex-col rounded-2xl border border-white/5 bg-[#12121f] overflow-hidden transition-all duration-300 hover:border-white/10 hover:shadow-2xl hover:shadow-violet-500/10"
    >
      {/* Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100 z-20"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(139, 92, 246, 0.1),
              transparent 80%
            )
          `,
        }}
      />

      {/* Hero Image Section */}
      <Link href={`/tool/${tool.id}`} className="relative block aspect-video w-full overflow-hidden bg-[#0a0a12]">
        {tool.screenshots && tool.screenshots.length > 0 ? (
           <Image
            src={tool.screenshots[0]}
            alt={tool.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          /* Fallback: Gradient or blurred logo */
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-900/20 via-[#0a0a12] to-[#0a0a12]">
             {tool.logo && tool.logo.startsWith("http") ? (
               <>
                <Image
                  src={tool.logo}
                  alt={tool.name}
                  fill
                  className="object-cover opacity-20 blur-xl scale-150"
                />
                <div className="absolute inset-0 bg-black/40" />
               </>
             ) : null}
             <div className="relative z-10 p-6 text-center">
                <span className="text-4xl opacity-20">✨</span>
             </div>
          </div>
        )}
        
        {/* Overlay Gradient for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12121f] via-transparent to-transparent opacity-90" />
        
        {/* Floating Logo (Bottom Left of Hero) */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#12121f] border border-white/10 shadow-lg overflow-hidden">
             {tool.logo && tool.logo.startsWith("http") ? (
              <Image 
                src={tool.logo} 
                alt={tool.name} 
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <span className="text-xl">🤖</span>
            )}
          </div>
        </div>

        {/* Favorite Button (Top Right) */}
        <div className="absolute top-3 right-3 z-20">
           <button
            onClick={toggleFavorite}
            className={`rounded-full p-2 backdrop-blur-md transition-all duration-200 hover:bg-white/10 active:scale-90 ${
              favorited 
                ? "bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20" 
                : "bg-black/30 text-white/40 hover:text-white ring-1 ring-white/10"
            }`}
          >
            <Heart className={`h-4 w-4 ${favorited ? "fill-current" : ""}`} />
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col p-5 pt-2">
        <Link href={`/tool/${tool.id}`} className="block mb-3">
          <div className="flex items-center justify-between gap-2 mb-1">
             <h3 className="text-lg font-bold text-white transition-colors group-hover:text-violet-300 line-clamp-1">
                {tool.name}
             </h3>
             {tool.is_trending && (
                <div className="flex shrink-0 items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-400 ring-1 ring-orange-500/20">
                  <Flame className="h-3 w-3 fill-orange-400" />
                  {/* Mock logic for visits display */}
                  <span>{(parseInt(tool.visits?.replace(/,/g, '') || '0') / 1000).toFixed(1)}k</span>
                </div>
              )}
          </div>
          <p className="line-clamp-2 text-sm leading-relaxed text-white/50 transition-colors group-hover:text-white/70 h-[40px]">
            {tool.description}
          </p>
        </Link>

        {/* Feature Badges (extracted from tags or new features field) */}
        <div className="mb-4 flex flex-wrap gap-1.5 h-[24px] overflow-hidden">
          {tool.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-medium text-white/40 ring-1 ring-white/5"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs font-medium text-amber-400/80">
              <Star className="h-3 w-3 fill-current" />
              {tool.rating}
            </div>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider ${pricingColors[tool.pricing]}`}>
              {tool.pricing_label}
            </span>
          </div>

          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group/btn flex items-center gap-1.5 text-xs font-medium text-white/40 transition-colors hover:text-violet-400"
          >
            Visit Site
            <ExternalLink className="h-3 w-3 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
