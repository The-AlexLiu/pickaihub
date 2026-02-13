import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolCard from "@/components/ToolCard";
import ToolActions from "@/components/ToolActions";
import { getTool, getRelatedTools } from "@/lib/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";

interface ToolPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { id } = await params;
  const tool = await getTool(id);

  if (!tool) {
    return { title: "Tool Not Found | PickAIHub" };
  }

  return {
    title: `${tool.name} — ${tool.category_label} AI Tool | PickAIHub`,
    description: tool.description,
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { id } = await params;
  const tool = await getTool(id);

  if (!tool) {
    notFound();
  }

  const relatedTools = await getRelatedTools(tool.category, tool.id, 4);

  // Pricing color map
  const pricingColor: Record<string, string> = {
    free: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    freemium: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    paid: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  };

  return (
    <div className="min-h-screen bg-[#0a0a12]">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-white/40">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span className="text-white/20">/</span>
          <Link href={`/?q=${tool.category_label}`} className="hover:text-white transition-colors">
            {tool.category_label}
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-white/70">{tool.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Left Column: Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Section */}
            <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-white/5 shadow-inner border border-white/5 overflow-hidden">
                {tool.logo && tool.logo.startsWith("http") ? (
                  <img src={tool.logo} alt={tool.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl">🤖</span>
                )}
              </div>
              <div className="flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold text-white">{tool.name}</h1>
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium ${pricingColor[tool.pricing] || pricingColor.free}`}>
                    {tool.pricing_label}
                  </span>
                  {tool.is_new && (
                    <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
                      New
                    </span>
                  )}
                  {tool.is_trending && (
                    <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-300">
                      🔥 Trending
                    </span>
                  )}
                </div>
                <p className="text-lg leading-relaxed text-white/60">{tool.description}</p>
              </div>
            </div>

            {/* Action Buttons (Client Component) */}
            <div className="mb-10">
              <ToolActions toolId={tool.id} toolUrl={tool.url} toolName={tool.name} />
            </div>

            {/* Stats Cards */}
            <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
                <div className="mb-1 text-2xl font-bold text-white">{tool.rating}</div>
                <div className="flex items-center justify-center gap-0.5 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`h-3.5 w-3.5 ${i < Math.round(tool.rating) ? "text-amber-400" : "text-white/10"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-white/30">Rating</p>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
                <div className="mb-1 text-2xl font-bold text-white">{tool.visits}</div>
                <p className="text-xs text-white/30">Monthly Visits</p>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
                <div className="mb-1 text-2xl font-bold text-white">{tool.pricing_label}</div>
                <p className="text-xs text-white/30">Pricing</p>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
                <div className="mb-1 text-2xl font-bold text-white">
                  {new Date(tool.launch_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </div>
                <p className="text-xs text-white/30">Launched</p>
              </div>
            </div>

            {/* About Section */}
            <div className="mb-10 rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-8">
              <h2 className="mb-4 text-xl font-bold text-white flex items-center gap-2">
                <span className="text-violet-400">📝</span> About {tool.name}
              </h2>
              <p className="text-white/60 leading-relaxed text-[15px]">
                {tool.description}
              </p>
            </div>

            {/* Tags */}
            {tool.tags.length > 0 && (
              <div className="mb-10">
                <h2 className="mb-4 text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-cyan-400">🏷️</span> Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/?q=${encodeURIComponent(tag)}`}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3.5 py-1.5 text-sm text-white/50 transition-colors hover:border-violet-500/30 hover:bg-violet-500/5 hover:text-violet-300"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sidebar */}
          <div>
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Quick Info Card */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                <h3 className="mb-4 text-base font-semibold text-white">Quick Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">Category</span>
                    <Link
                      href={`/?q=${tool.category_label}`}
                      className="rounded-md bg-white/5 px-2.5 py-1 text-white/70 hover:text-white transition-colors"
                    >
                      {tool.category_label}
                    </Link>
                  </div>
                  <div className="h-px bg-white/5" />
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">Pricing</span>
                    <span className="text-white/70">{tool.pricing_label}</span>
                  </div>
                  <div className="h-px bg-white/5" />
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">Website</span>
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-400 hover:text-violet-300 transition-colors truncate max-w-[160px]"
                    >
                      {new URL(tool.url).hostname.replace("www.", "")}
                    </a>
                  </div>
                </div>
              </div>

              {/* Related Tools */}
              <div>
                <h3 className="mb-4 text-base font-semibold text-white flex items-center gap-2">
                  <span className="text-amber-400">⚡</span> Related {tool.category_label} Tools
                </h3>
                <div className="flex flex-col gap-3">
                  {relatedTools.map((t) => (
                    <ToolCard key={t.id} tool={t} />
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-transparent p-6">
                <div className="mb-3 text-3xl">💡</div>
                <h4 className="mb-2 font-semibold text-white">Know a great tool?</h4>
                <p className="mb-4 text-sm text-white/50 leading-relaxed">
                  Help others by submitting AI tools you love to our directory.
                </p>
                <Link
                  href="/submit"
                  className="block w-full rounded-lg bg-white/10 py-2.5 text-center text-sm font-medium text-white transition-all hover:bg-white/20"
                >
                  Submit a Tool →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
