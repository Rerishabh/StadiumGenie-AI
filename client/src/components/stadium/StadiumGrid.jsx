import React from 'react';
import StadiumCard from './StadiumCard';

export default function StadiumGrid({ items = [] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {items.map((s) => <StadiumCard key={s._id || s.id} stadium={s} />)}
    </div>
  );
}