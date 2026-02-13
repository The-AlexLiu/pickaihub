import { Tool } from "@/lib/types";
import ToolCard from "./ToolCard";

interface FeaturedProps {
  tools: Tool[];
}

export default function Featured({ tools }: FeaturedProps) {
  if (tools.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20 text-lg">
            🔥
          </span>
          Featured & Trending
        </h2>
        <a href="/?q=all" className="text-sm text-white/40 hover:text-white transition-colors">
          View All →
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}
