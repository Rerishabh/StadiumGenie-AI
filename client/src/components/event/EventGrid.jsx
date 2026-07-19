import React from 'react';
import EventCard from './EventCard';

export default function EventGrid({ items = [] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {items.map((e) => <EventCard key={e._id || e.id} event={e} />)}
    </div>
  );
}