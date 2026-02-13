"use client";

import { useState } from "react";
export default function Sidebar() {
  const [email, setEmail] = useState("");

  return (
    <aside className="flex flex-col gap-6">


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
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-violet-500/50"
          />
          <button className="rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-all duration-200 hover:shadow-violet-500/35">
            Subscribe Free
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
