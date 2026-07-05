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
    <div className="flex items-center justify-center gap-4 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="flex items-center gap-2 rounded-lg bg-gradient-netflix px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
      >
        <ChevronLeft className="h-5 w-5" />
        Previous
      </button>
      <span className="px-4 py-2 rounded-lg bg-slate-800 text-white font-medium">
        Page {currentPage}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLoading || !hasNextPage}
        className="flex items-center gap-2 rounded-lg bg-gradient-netflix px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
      >
        Next
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};
