export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="surface overflow-hidden">
          <div className="aspect-[4/3] animate-pulse bg-amber-100" />
          <div className="grid gap-3 p-4">
            <div className="h-4 w-24 animate-pulse rounded bg-amber-100" />
            <div className="h-6 w-3/4 animate-pulse rounded bg-amber-100" />
            <div className="h-4 w-full animate-pulse rounded bg-amber-100" />
            <div className="h-10 w-full animate-pulse rounded bg-amber-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
