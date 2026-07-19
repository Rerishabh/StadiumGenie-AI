import React from 'react';
import Button from './Button';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const prev = () => onPageChange(Math.max(1, currentPage - 1));
  const next = () => onPageChange(Math.min(totalPages, currentPage + 1));

  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      <Button onClick={prev} disabled={currentPage <= 1}>Previous</Button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1 rounded ${p === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        >
          {p}
        </button>
      ))}
      <Button onClick={next} disabled={currentPage >= totalPages}>Next</Button>
    </div>
  );
}