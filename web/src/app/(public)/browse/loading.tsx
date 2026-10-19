// Loading Skeleton for Browse Page (FST Unit 3: loading.tsx & Streaming Boundaries)
export default function BrowseLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="h-8 w-48 bg-slate-200 animate-pulse rounded mb-4" />
      <div className="h-4 w-96 bg-slate-200 animate-pulse rounded mb-8" />

      {/* Filter skeleton */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 w-28 bg-slate-200 animate-pulse rounded-full shrink-0" />
        ))}
      </div>

      {/* Cards skeleton grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-card overflow-hidden h-72 animate-pulse flex flex-col">
            <div className="h-40 bg-slate-200 w-full" />
            <div className="p-4 flex flex-col gap-2 flex-1">
              <div className="h-4 w-20 bg-slate-200 rounded" />
              <div className="h-5 w-3/4 bg-slate-200 rounded" />
              <div className="h-3 w-full bg-slate-200 rounded mt-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
