import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  hasNextPage?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  onPageChange,
  isLoading = false,
  hasNextPage = true
}) => {
  return (
    <div className="flex items-center justify-center gap-3 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="flex items-center gap-1.5 rounded-xl bg-gradient-netflix px-4 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition-all"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>
      <span className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm font-semibold shadow-inner">
        Page {currentPage}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLoading || !hasNextPage}
        className="flex items-center gap-1.5 rounded-xl bg-gradient-netflix px-4 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition-all"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};
