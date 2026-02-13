"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

const CATEGORIES = [
  { id: "text", label: "Text & Writing" },
  { id: "image", label: "Image & Design" },
  { id: "video", label: "Video" },
  { id: "code", label: "Code & Dev" },
  { id: "audio", label: "Audio & Music" },
  { id: "business", label: "Business" },
  { id: "marketing", label: "Marketing" },
  { id: "productivity", label: "Productivity" },
  { id: "education", label: "Education" },
  { id: "finance", label: "Finance" },
  { id: "3d", label: "3D" },
  { id: "fun", label: "Fun & Social" },
  { id: "other", label: "Other" },
];

const PRICING_OPTIONS = [
  { id: "free", label: "Free" },
  { id: "freemium", label: "Freemium" },
  { id: "paid", label: "Paid" },
];

export default function SubmitPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [pricing, setPricing] = useState("free");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !tags.includes(tag) && tags.length < 5) {
        setTags([...tags, tag]);
        setTagInput("");
      }
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url, description, category, pricing, tags }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a12]">
        <Header />
        <main className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </main>
        <Footer />
      </div>
    );
  }

  // Redirect unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a12]">
        <Header />
        <main className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="mb-4 text-5xl">🔒</div>
            <h1 className="mb-2 text-2xl font-bold text-white">Sign in Required</h1>
            <p className="mb-6 text-white/50">
              You need to be logged in to submit a tool.
            </p>
            <Link
              href="/signup"
              className="inline-flex rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40"
            >
              Sign In / Sign Up
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a12]">
        <Header />
        <main className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="mb-4 text-5xl">🎉</div>
            <h1 className="mb-2 text-2xl font-bold text-white">Tool Submitted!</h1>
            <p className="mb-6 text-white/50">
              Thanks for your submission! Our team will review it and add it to the directory once approved.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setSuccess(false);
                  setName("");
                  setUrl("");
                  setDescription("");
                  setCategory("");
                  setPricing("free");
                  setTags([]);
                }}
                className="rounded-lg bg-white/5 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Submit Another
              </button>
              <Link
                href="/"
                className="rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a12]">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-white">Submit an AI Tool</h1>
          <p className="text-white/50">
            Help others discover great AI tools. Submissions are reviewed within 24–48 hours.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-[#13131f] p-6 sm:p-8 shadow-xl">
          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Tool Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/70">
                Tool Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/30 outline-none transition-all focus:border-violet-500/50 focus:bg-white/10"
                placeholder="e.g. ChatGPT, Midjourney"
              />
            </div>

            {/* URL */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/70">
                Website URL <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/30 outline-none transition-all focus:border-violet-500/50 focus:bg-white/10"
                placeholder="https://example.com"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/70">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/30 outline-none transition-all focus:border-violet-500/50 focus:bg-white/10 resize-none"
                placeholder="Briefly describe what this tool does and who it's for..."
              />
              <p className="mt-1 text-xs text-white/20">{description.length}/500</p>
            </div>

            {/* Category & Pricing Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/70">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none transition-all focus:border-violet-500/50 focus:bg-white/10 appearance-none"
                >
                  <option value="" disabled className="bg-[#13131f]">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#13131f]">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/70">
                  Pricing
                </label>
                <div className="flex gap-2">
                  {PRICING_OPTIONS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPricing(p.id)}
                      className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-all ${
                        pricing === p.id
                          ? "border-violet-500/50 bg-violet-500/10 text-violet-300"
                          : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/70">
                Tags <span className="text-white/30 font-normal">(optional, up to 5)</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-md border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-xs text-violet-300"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-0.5 text-violet-300/60 hover:text-violet-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {tags.length < 5 && (
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/30 outline-none transition-all focus:border-violet-500/50 focus:bg-white/10"
                  placeholder="Type tag and press Enter"
                />
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit Tool for Review"
            )}
          </button>

          <p className="mt-4 text-center text-xs text-white/25">
            By submitting, you confirm this tool is legitimate and the information is accurate.
          </p>
        </form>
      </main>

      <Footer />
    </div>
  );
}
