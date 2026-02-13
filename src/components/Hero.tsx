"use client";

import { useDebouncedCallback } from "use-debounce";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface HeroProps {
  totalTools: number;
}

export default function Hero({ totalTools }: HeroProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  // Sync local state with URL param on mount
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // Debounce URL updates
  const debouncedUpdateUrl = useDebouncedCallback((query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    router.replace(`/?${params.toString()}`);
  }, 500);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    debouncedUpdateUrl(query);
  };

  const totalToolsFormatted = totalTools.toLocaleString();

  const stats = [
    { value: `${totalToolsFormatted}+`, label: "AI Tools Collected" },
    { value: "13", label: "Categories" },
    { value: "500k+", label: "Monthly Visits" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0a0a12] via-[#0d0d1a] to-[#0a0a12] py-20 sm:py-28">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-violet-600/10 blur-[128px]" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[128px]" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/5 blur-[96px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300 mb-8 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            {totalToolsFormatted}+ AI Tools Collected
          </div>

          {/* Title */}
          <h1 className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl mb-6">
            Find the Best AI Tools <br />
            <span className="text-violet-400">For Any Task</span>
          </h1>

          <p className="mb-10 text-lg text-white/50">
            A curated directory of artificial intelligence tools to boost your productivity. Daily updates with the latest releases.
          </p>

          {/* Search */}
          <div className="relative mx-auto max-w-2xl group">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 opacity-30 blur transition duration-500 group-hover:opacity-50"></div>
            <div className="relative flex items-center rounded-xl bg-[#13131f] p-2 ring-1 ring-white/10">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-white/40">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="w-full bg-transparent border-0 py-3 pl-11 pr-4 text-white placeholder-white/40 focus:ring-0 sm:text-lg"
                    placeholder="Search AI tools (e.g. 'chat', 'image generation')..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
                  />
                </div>
              </div>
              <button
                onClick={() => handleSearch(searchQuery)}
                className="ml-2 rounded-lg bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-500/25"
              >
                Search
              </button>
            </div>
          </div>

          {/* Quick search tags */}
          <div className="mt-8 flex flex-wrap justify-center gap-2 text-sm text-white/40">
            <span>Popular:</span>
            {["ChatGPT", "Midjourney", "Copy.ai", "Notion AI"].map((tag) => (
              <button
                key={tag}
                onClick={() => handleSearch(tag)}
                className="hover:text-white hover:underline transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/5 pt-8 sm:w-full sm:max-w-3xl sm:mx-auto">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
