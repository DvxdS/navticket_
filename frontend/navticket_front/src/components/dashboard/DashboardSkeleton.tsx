import { SkeletonStats } from './Skeleton';

export const DashboardSkeleton = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="animate-pulse space-y-2">
        <div className="h-8 bg-slate-200 rounded w-48"></div>
        <div className="h-4 bg-slate-100 rounded w-64"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <SkeletonStats key={i} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
          <div className="space-y-4">
            <div className="h-6 bg-slate-200 rounded w-40"></div>
            <div className="h-64 bg-slate-100 rounded"></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
          <div className="space-y-4">
            <div className="h-6 bg-slate-200 rounded w-40"></div>
            <div className="h-64 bg-slate-100 rounded"></div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
        <div className="space-y-4">
          <div className="h-6 bg-slate-200 rounded w-48"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-100">
              <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              </div>
              <div className="h-8 w-20 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};