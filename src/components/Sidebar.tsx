"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { categories } from "@/data/categories";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function Sidebar() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Extract category from pathname: /category/[slug]
  const isCategoryPage = pathname.startsWith("/category/");
  const categorySlug = isCategoryPage ? pathname.split("/category/")[1] : "all";

  // Fallback to query param for legacy support or mixed usage
  const queryCategory = searchParams.get("category");

  const activeCategory = isCategoryPage ? categorySlug : (queryCategory || "all");

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) return;

    setStatus("loading");
    
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Failed to subscribe");

      setStatus("success");
      setEmail("");
      
      // Reset after 3 seconds
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    } catch (error) {
      console.error(error);
      setStatus("idle");
      // Optionally show error toast here
    }
  };

  return (
    <aside className="flex flex-col gap-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
      {/* Categories (Desktop) */}
      <div className="rounded-xl border border-white/[0.06] bg-[#12121f]/80 p-5">
        <h3 className="mb-4 text-sm font-semibold text-white">Categories</h3>
        <div className="flex flex-col gap-1.5">
          {categories.map((category) => {
            const isActive = activeCategory === category.id;
            const href = category.id === "all" ? "/" : `/category/${category.id}`;
            return (
              <Link
                key={category.id}
                href={href}
                className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-violet-500/10 text-violet-400"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`text-base transition-transform duration-200 group-hover:scale-110 ${isActive ? "opacity-100" : "opacity-70"}`}>
                    {category.icon}
                  </span>
                  <span className="font-medium">{category.name}</span>
                </div>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Newsletter */}
      <div className="rounded-xl border border-violet-500/20 bg-gradient-to-b from-violet-500/5 to-transparent p-5">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-500/15 text-xs">
            📧
          </span>
          Weekly Newsletter
        </h3>
        <p className="mb-4 text-xs leading-relaxed text-white/40">
          Get the latest AI tools and industry updates delivered to your inbox every week.
        </p>
        <div className="flex flex-col gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={status !== "idle"}
            onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-violet-500/50 disabled:opacity-50"
          />
          <button 
            onClick={handleSubscribe}
            disabled={status !== "idle" || !email}
            className={`flex items-center justify-center rounded-lg py-2 text-sm font-medium text-white shadow-lg transition-all duration-200 ${
              status === "success" 
                ? "bg-emerald-500 shadow-emerald-500/20" 
                : "bg-gradient-to-r from-violet-600 to-cyan-500 shadow-violet-500/20 hover:shadow-violet-500/35 disabled:opacity-70 disabled:cursor-not-allowed"
            }`}
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : status === "success" ? (
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4" />
                <span>Subscribed!</span>
              </div>
            ) : (
              "Subscribe Free"
            )}
          </button>
        </div>
        <p className="mt-3 text-center text-[11px] text-white/20">
          Joined by 12,000+ subscribers · Unsubscribe anytime
        </p>
      </div>

      {/* Ad placeholder */}
      <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.01] p-6 text-center">
        <div className="mb-2 text-2xl">📢</div>
        <p className="text-xs text-white/25">Advertise Here</p>
        <a href="#" className="mt-1 text-xs text-violet-400/50 hover:text-violet-400 transition-colors">
          Learn More →
        </a>
      </div>
    </aside>
  );
}
