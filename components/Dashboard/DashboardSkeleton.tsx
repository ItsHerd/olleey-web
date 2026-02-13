/**
 * Dashboard loading skeleton
 * Placeholder component for dashboard loading state
 */

interface DashboardSkeletonProps {
  borderClass?: string;
  cardClass?: string;
}

export function DashboardSkeleton({ borderClass, cardClass }: DashboardSkeletonProps) {
  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div className="space-y-4 w-full max-w-4xl">
        {/* Header skeleton */}
        <div className={`h-8 w-64 ${cardClass} animate-pulse rounded`} />

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`h-40 ${cardClass} animate-pulse rounded-lg`} />
          ))}
        </div>

        {/* Table skeleton */}
        <div className="space-y-2 mt-8">
          <div className={`h-12 ${cardClass} animate-pulse rounded`} />
          <div className={`h-12 ${cardClass} animate-pulse rounded`} />
          <div className={`h-12 ${cardClass} animate-pulse rounded`} />
        </div>
      </div>
    </div>
  );
}
