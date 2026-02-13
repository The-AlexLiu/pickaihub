import { Star, ExternalLink, Image as ImageIcon, CheckCircle, Zap } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolCard from "@/components/ToolCard";
import ToolActions from "@/components/ToolActions";
import { getTool, getRelatedTools } from "@/lib/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface ToolPageProps {
  params: Promise<{
    id: string;
  }>;
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
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-white/5 shadow-inner border border-white/5 overflow-hidden">
                {tool.logo && tool.logo.startsWith("http") ? (
                  <Image 
                    src={tool.logo} 
                    alt={tool.name} 
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
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
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center group hover:bg-white/[0.04] transition-colors">
                <div className="mb-1 text-2xl font-bold text-white flex items-center justify-center gap-1.5">
                    {tool.rating} <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                </div>
                <p className="text-xs text-white/30 group-hover:text-white/50 transition-colors">Rating</p>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center group hover:bg-white/[0.04] transition-colors">
                <div className="mb-1 text-2xl font-bold text-white">{tool.visits}</div>
                <p className="text-xs text-white/30 group-hover:text-white/50 transition-colors">Monthly Visits</p>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center group hover:bg-white/[0.04] transition-colors">
                <div className="mb-1 text-2xl font-bold text-white capitalize">{tool.pricing}</div>
                <p className="text-xs text-white/30 group-hover:text-white/50 transition-colors">Model</p>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center group hover:bg-white/[0.04] transition-colors">
                <div className="mb-1 text-2xl font-bold text-white">
                  {new Date(tool.launch_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </div>
                <p className="text-xs text-white/30 group-hover:text-white/50 transition-colors">Launched</p>
              </div>
            </div>
            
            {/* Screenshots Gallery (New) */}
            {tool.screenshots && tool.screenshots.length > 0 && (
              <div className="mb-10">
                <h2 className="mb-6 text-xl font-bold text-white flex items-center gap-2">
                   <ImageIcon className="text-violet-400 h-5 w-5" /> Gallery
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {tool.screenshots.map((shot, idx) => (
                    <div key={idx} className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/20 group cursor-pointer">
                      <Image 
                        src={shot} 
                        alt={`${tool.name} screenshot ${idx + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* About Section */}
            <div className="mb-10 rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-8">
              <h2 className="mb-4 text-xl font-bold text-white flex items-center gap-2">
                <span className="text-violet-400">📝</span> About {tool.name}
              </h2>
              <p className="text-white/60 leading-relaxed text-[15px] whitespace-pre-wrap">
                {tool.description}
              </p>
              
              {/* Key Features (New) */}
              {tool.features && tool.features.length > 0 && (
                <div className="mt-8 pt-8 border-t border-white/5">
                  <h3 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
                     <Zap className="text-amber-400 h-4 w-4" /> Key Features
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {tool.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 rounded-lg bg-white/5 p-3 text-sm text-white/70">
                        <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                    <div className="text-right">
                        <span className="block text-white/70">{tool.pricing_label}</span>
                        {tool.price_detail && (
                            <span className="block text-xs text-white/40 mt-0.5">{tool.price_detail}</span>
                        )}
                    </div>
                  </div>
                  <div className="h-px bg-white/5" />
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">Website</span>
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-400 hover:text-violet-300 transition-colors truncate max-w-[160px] flex items-center gap-1"
                    >
                      {new URL(tool.url).hostname.replace("www.", "")}
                      <ExternalLink className="h-3 w-3" />
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
