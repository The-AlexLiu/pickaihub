"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useFavorites } from "@/hooks/useFavorites";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

interface ToolActionsProps {
  toolId: string;
  toolUrl: string;
  toolName: string;
}

export default function ToolActions({ toolId, toolUrl, toolName }: ToolActionsProps) {
  const { user } = useAuth();
  const { addFavorite, removeFavorite, isFavorited } = useFavorites();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const favorited = isFavorited(toolId);

  const handleFavorite = () => {
    if (!user) {
      router.push("/signup");
      return;
    }
    if (favorited) {
      removeFavorite.mutate(toolId);
    } else {
      addFavorite.mutate(toolId);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: toolName, url });
        return;
      } catch {
        // User cancelled or share failed, fall through to copy
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {/* Visit Website */}
      <a
        href={toolUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:shadow-violet-500/40 hover:scale-[1.02]"
      >
        Visit Website
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>

      {/* Save / Favorite */}
      <button
        onClick={handleFavorite}
        className={`inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3.5 text-base font-medium transition-all duration-200 ${
          favorited
            ? "border-pink-500/30 bg-pink-500/10 text-pink-400 hover:bg-pink-500/20"
            : "border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20"
        }`}
      >
        <Heart className={`h-5 w-5 ${favorited ? "fill-pink-400" : ""}`} />
        {favorited ? "Saved" : "Save"}
      </button>

      {/* Share */}
      <button
        onClick={handleShare}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-base font-medium text-white transition-all duration-200 hover:bg-white/10 hover:border-white/20"
      >
        {copied ? (
          <>
            <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share
          </>
        )}
      </button>
    </div>
  );
}
