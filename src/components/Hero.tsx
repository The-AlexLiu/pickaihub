"use client";

import { useDebouncedCallback } from "use-debounce";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Sparkles, Search } from "lucide-react";
import { motion } from "framer-motion";
import BackgroundBeams from "./BackgroundBeams";
import AnimatedNumber from "./AnimatedNumber";

interface HeroProps {
  totalTools: number;
  onSearchChange?: (query: string) => void;
  searchValue?: string;
}

export default function Hero({ totalTools, onSearchChange, searchValue = "" }: HeroProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // We use local state for immediate UI feedback, but sync with parent/URL
  const [searchQuery, setSearchQuery] = useState(searchValue);
  const [placeholder, setPlaceholder] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  // Sync internal state if parent prop changes (e.g. from URL initially)
  useEffect(() => {
    setSearchQuery(searchValue);
  }, [searchValue]);

  const placeholders = [
    "Search AI tools...",
    "Try 'Image Generation'...",
    "Try 'Coding Assistant'...",
    "Try 'Video Editor'...",
    "Try 'ChatGPT'...",
  ];

  // Typewriter effect logic
  useEffect(() => {
    const i = loopNum % placeholders.length;
    const fullText = placeholders[i];

    const handleTyping = () => {
      setPlaceholder(
        isDeleting
          ? fullText.substring(0, placeholder.length - 1)
          : fullText.substring(0, placeholder.length + 1)
      );

      setTypingSpeed(isDeleting ? 30 : 150);

      if (!isDeleting && placeholder === fullText) {
        setTimeout(() => setIsDeleting(true), 1500); // Pause at end
      } else if (isDeleting && placeholder === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);

    return () => clearTimeout(timer);
  }, [placeholder, isDeleting, loopNum, typingSpeed, placeholders]);

  // Handle Input Change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    // Notify parent for instant filtering
    if (onSearchChange) {
        onSearchChange(val);
    }
  };

  // Keep the router push for "Enter" key or explicit search button click
  // This allows deep linking and server-side fallback
  const handleSubmitSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      params.set("q", searchQuery);
    } else {
      params.delete("q");
    }
    router.replace(`/?${params.toString()}`);
  };
  
  const clearSearch = () => {
    setSearchQuery("");
    if (onSearchChange) onSearchChange("");
    
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    router.replace(`/?${params.toString()}`);
  };

  const stats = [
    { value: totalTools, suffix: "+", label: "AI Tools Collected" },
    { value: 13, suffix: "", label: "Categories" },
    { value: 500, suffix: "k+", label: "Monthly Visits" },
  ];

  return (
    <section className="relative overflow-hidden bg-[#0a0a12] py-24 sm:py-32">
      <BackgroundBeams />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300 mb-8 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            <span className="font-medium">
              {totalTools.toLocaleString()}+ AI Tools Collected
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-7xl mb-6 leading-[1.1]"
          >
            Find the Best AI Tools <br />
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400"
            >
              For Any Task
            </motion.span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-12 text-lg text-white/50 max-w-2xl mx-auto leading-relaxed"
          >
            A curated directory of artificial intelligence tools to boost your productivity. Daily updates with the latest releases from around the world.
          </motion.p>

          {/* Search */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative mx-auto max-w-2xl group"
          >
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-600 via-cyan-500 to-indigo-600 opacity-30 blur-lg transition duration-500 group-hover:opacity-60 group-hover:blur-xl"></div>
            <div className="relative flex items-center rounded-xl bg-[#0a0a12]/90 p-2 ring-1 ring-white/10 backdrop-blur-xl transition-all duration-300 focus-within:ring-violet-500/50">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-white/40">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    className="w-full bg-transparent border-0 py-4 pl-12 pr-10 text-white placeholder-white/40 focus:ring-0 text-lg"
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmitSearch()}
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/40 hover:text-white transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={handleSubmitSearch}
                className="ml-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                Search
              </button>
            </div>
          </motion.div>

          {/* Quick search tags */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex flex-wrap justify-center gap-3 text-sm"
          >
            <span className="text-white/40">Popular:</span>
            {["ChatGPT", "Midjourney", "Copy.ai", "Notion AI"].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                    setSearchQuery(tag);
                    if (onSearchChange) onSearchChange(tag);
                    // Also trigger URL update for deep linking context
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("q", tag);
                    router.replace(`/?${params.toString()}`);
                }}
                className="text-white/60 hover:text-violet-300 transition-colors bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full border border-white/5 hover:border-violet-500/30"
              >
                {tag}
              </button>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-20 grid grid-cols-3 gap-8 border-t border-white/5 pt-10 sm:w-full sm:max-w-3xl sm:mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="relative group">
                <div className="absolute -inset-4 rounded-xl bg-white/5 opacity-0 transition duration-300 group-hover:opacity-100 blur-xl"></div>
                <div className="relative">
                  <div className="text-4xl font-bold text-white mb-2 tracking-tight">
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm font-medium text-white/40 uppercase tracking-wider">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
