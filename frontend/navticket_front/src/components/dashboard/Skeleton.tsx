export const SkeletonCard = () => (
    <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-100 rounded w-1/2"></div>
          </div>
          <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-10 w-10 bg-slate-200 rounded-lg"></div>
            <div className="h-3 bg-slate-100 rounded w-16"></div>
            <div className="h-4 bg-slate-200 rounded w-20"></div>
          </div>
          <div className="space-y-2">
            <div className="h-10 w-10 bg-slate-200 rounded-lg"></div>
            <div className="h-3 bg-slate-100 rounded w-16"></div>
            <div className="h-4 bg-slate-200 rounded w-20"></div>
          </div>
        </div>
  
        <div className="space-y-2">
          <div className="h-3 bg-slate-100 rounded w-full"></div>
          <div className="h-2.5 bg-slate-200 rounded-full w-full"></div>
          <div className="h-3 bg-slate-100 rounded w-1/3"></div>
        </div>
  
        <div className="space-y-2">
          <div className="h-12 bg-slate-200 rounded-lg w-full"></div>
          <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
        </div>
      </div>
    </div>
  );
  
  export const SkeletonTable = () => (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="animate-pulse">
        {/* Header */}
        <div className="border-b border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div className="h-5 bg-slate-200 rounded w-32"></div>
            <div className="h-5 bg-slate-200 rounded w-24"></div>
          </div>
        </div>
        
        {/* Rows */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              </div>
              <div className="h-8 w-20 bg-slate-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  export const SkeletonStats = () => (
    <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-100 rounded w-24"></div>
          <div className="h-6 bg-slate-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );