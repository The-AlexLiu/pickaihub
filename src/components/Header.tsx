"use client";

import { useState } from "react";
import Link from "next/link";
import { HEADER_CATEGORIES } from "@/data/categories";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Heart } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a12]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 text-lg font-bold text-white shadow-lg shadow-violet-500/25">
            P
          </div>
          <span className="text-xl font-bold">
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              PickAI
            </span>
            <span className="text-white/90">Hub</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {HEADER_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/?q=${category.id}#tool-list`}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white/60 transition-all duration-200 hover:bg-white/5 hover:text-white"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-9 w-20 animate-pulse rounded-lg bg-white/5" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/submit"
                className="hidden sm:flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                + Submit
              </Link>
              <Link
                href="/favorites"
                className="hidden sm:flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                <Heart className="h-4 w-4 text-violet-400" />
                <span>Favorites</span>
              </Link>
              
              <div className="group relative">
                <button className="flex items-center gap-2 rounded-lg p-1 hover:bg-white/5 transition-colors">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-violet-500 to-cyan-500 text-xs font-bold text-white">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                </button>
                
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 origin-top-right scale-95 opacity-0 invisible transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 group-hover:visible z-50">
                  <div className="rounded-xl border border-white/10 bg-[#13131f] p-1 shadow-xl">
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                      <p className="text-xs text-white/50 truncate">{user.email}</p>
                    </div>
                    <Link href="/favorites" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white sm:hidden">
                      <Heart className="h-4 w-4" />
                      Favorites
                    </Link>
                    <Link href="/submit" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white sm:hidden">
                      + Submit Tool
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/signup"
                className="hidden rounded-lg bg-white/5 py-2 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10 sm:block"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:shadow-violet-500/40"
              >
                Sign Up
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white md:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-[#0a0a12]/95 px-4 py-4 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1">
            {HEADER_CATEGORIES.map((category) => (
              <Link
                key={category.id}
                href={`/?q=${category.id}#tool-list`}
                className="rounded-lg px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
            {!user && (
              <Link
                href="/signup"
                className="mt-2 rounded-lg bg-white/5 px-4 py-3 text-center text-sm font-medium text-white"
                onClick={() => setMenuOpen(false)}
              >
                Sign Up / Log In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
