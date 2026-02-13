export default function ToolCardSkeleton() {
  return (
    <div className="relative rounded-xl border border-white/[0.06] bg-[#12121f]/80 p-5">
      <div className="flex gap-4 animate-pulse">
        {/* Logo Skeleton */}
        <div className="h-12 w-12 shrink-0 rounded-xl bg-white/5" />

        <div className="min-w-0 flex-1 space-y-3">
          {/* Title + Category Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <div className="h-5 w-32 rounded bg-white/5" />
              <div className="h-5 w-16 rounded bg-white/5" />
            </div>
            {/* Heart Icon Skeleton */}
            <div className="h-8 w-8 rounded-full bg-white/5" />
          </div>

          {/* Description Skeleton */}
          <div className="space-y-1.5">
            <div className="h-4 w-full rounded bg-white/5" />
            <div className="h-4 w-2/3 rounded bg-white/5" />
          </div>

          {/* Tags Skeleton */}
          <div className="flex gap-1.5">
            <div className="h-6 w-16 rounded bg-white/5" />
            <div className="h-6 w-20 rounded bg-white/5" />
            <div className="h-6 w-14 rounded bg-white/5" />
          </div>

          {/* Footer Skeleton */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-4">
              {/* Visits */}
              <div className="h-4 w-12 rounded bg-white/5" />
              {/* Rating */}
              <div className="h-4 w-10 rounded bg-white/5" />
              {/* Pricing */}
              <div className="h-5 w-14 rounded-full bg-white/5" />
            </div>
            {/* Button */}
            <div className="h-8 w-20 rounded-lg bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
