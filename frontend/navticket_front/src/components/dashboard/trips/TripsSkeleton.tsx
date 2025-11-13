import { SkeletonStats, SkeletonTable } from '../Skeleton';

export const TripsSkeleton = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-pulse">
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 rounded w-48"></div>
          <div className="h-4 bg-slate-100 rounded w-64"></div>
        </div>
        <div className="h-10 w-36 bg-slate-200 rounded-lg"></div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
        <div className="flex gap-4">
          <div className="flex-1 h-10 bg-slate-200 rounded-lg"></div>
          <div className="w-40 h-10 bg-slate-200 rounded-lg"></div>
          <div className="w-40 h-10 bg-slate-200 rounded-lg"></div>
          <div className="w-40 h-10 bg-slate-200 rounded-lg"></div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <SkeletonStats key={i} />
        ))}
      </div>

      {/* Table */}
      <SkeletonTable />
    </div>
  );
};