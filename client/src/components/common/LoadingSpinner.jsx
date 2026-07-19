import React from 'react';

export default function LoadingSpinner({ size = 'md' }) {
  const dim = size === 'sm' ? 'h-4 w-4' : 'h-8 w-8';
  return <div className={`animate-spin rounded-full ${dim} border-t-2 border-b-2 border-blue-600`} />;
}