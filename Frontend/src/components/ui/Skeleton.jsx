import { Card } from "./Card";

export const Skeleton = ({ className = "" }) => <div className={`skeleton ${className}`} aria-hidden="true" />;

export const SkeletonStatGrid = ({ count = 4 }) => (
  <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4" aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="p-4 sm:p-5">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="mt-4 h-7 w-20" />
        <Skeleton className="mt-3 h-3 w-28" />
      </Card>
    ))}
  </div>
);

export const SkeletonCard = ({ className = "", lines = 4, chart = false }) => (
  <Card className={`p-5 ${className}`} aria-hidden="true">
    <Skeleton className="h-4 w-36" />
    <Skeleton className="mt-2 h-3 w-52" />
    {chart ? (
      <Skeleton className="mt-6 h-56 w-full rounded-lg" />
    ) : (
      <div className="mt-6 space-y-4">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )}
  </Card>
);

export const SkeletonTable = ({ rows = 6 }) => (
  <div aria-hidden="true">
    <div className="flex gap-4 border-b border-line bg-surface-2/60 px-5 py-3">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="ml-auto h-3 w-16" />
      <Skeleton className="h-3 w-16" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 border-b border-line px-5 py-3.5 last:border-0">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="ml-auto h-3.5 w-20" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    ))}
  </div>
);

// Wraps a loading region so assistive tech announces it once.
export const LoadingRegion = ({ label = "Loading", children }) => (
  <div role="status" aria-live="polite" aria-busy="true">
    <span className="sr-only">{label}</span>
    {children}
  </div>
);
