// Frontend/src/components/dashboard/Pagination.tsx

interface PaginationProps {
    currentCount: number;
    totalCount: number;
    hasNext: boolean;
    hasPrevious: boolean;
    onNext: () => void;
    onPrevious: () => void;
  }
  
  export const Pagination = ({
    currentCount,
    totalCount,
    hasNext,
    hasPrevious,
    onNext,
    onPrevious,
  }: PaginationProps) => {
    if (totalCount === 0) return null;
  
    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
        <p className="text-sm text-slate-600">
          Affichage de <span className="font-medium">{currentCount}</span> sur{' '}
          <span className="font-medium">{totalCount}</span> résultats
        </p>
        <div className="flex gap-2">
          <button
            onClick={onPrevious}
            disabled={!hasPrevious}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Précédent
          </button>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Suivant
          </button>
        </div>
      </div>
    );
  };