import { useState, useCallback } from 'react';

export default function usePagination(initialPage = 1, initialTotal = 1) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotal);

  const nextPage = useCallback(() => {
    setCurrentPage((p) => {
      if (p < totalPages) return p + 1;
      return p;
    });
  }, [totalPages]);

  const previousPage = useCallback(() => {
    setCurrentPage((p) => {
      if (p > 1) return p - 1;
      return p;
    });
  }, []);

  const goToPage = useCallback((page) => {
    if (!Number.isInteger(page)) return;
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }, [totalPages]);

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    nextPage,
    previousPage,
    goToPage,
  };
}