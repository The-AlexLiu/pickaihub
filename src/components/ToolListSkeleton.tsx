import ToolCardSkeleton from "./ToolCardSkeleton";

export default function ToolListSkeleton() {
  return (
    <div>
      {/* Header Skeleton */}
      <div className="mb-5 flex items-center justify-between animate-pulse">
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 bg-white/5 rounded" />
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-white/5 rounded-lg" />
            <div className="h-8 w-20 bg-white/5 rounded-lg" />
            <div className="h-8 w-20 bg-white/5 rounded-lg" />
          </div>
        </div>
        <div className="h-5 w-20 bg-white/5 rounded" />
      </div>

      {/* Cards Grid */}
      <div className="flex flex-col gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ToolCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
