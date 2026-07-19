import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { resolveEventImage, getEventFallbackForEvent, DEFAULT_EVENT_FALLBACK } from '../../utils/imageResolver';

export default function EventCard({ event }) {
  const coverImage = resolveEventImage(event);
  const [imgSrc, setImgSrc] = useState(coverImage);

  // Cards can be reused by React as filters and pagination change. Reset the
  // image state when the displayed event changes instead of retaining a prior
  // card's failed URL/fallback.
  useEffect(() => {
    setImgSrc(coverImage);
  }, [coverImage]);

  if (!event) return null;

  const eventId = event.id || event._id;

  const handleImgError = () => {
    const sportFallback = getEventFallbackForEvent(event);
    if (imgSrc !== sportFallback) {
      setImgSrc(sportFallback);
    } else if (imgSrc !== DEFAULT_EVENT_FALLBACK) {
      setImgSrc(DEFAULT_EVENT_FALLBACK);
    }
  };

  const price = event.price != null ? `₹${event.price.toLocaleString('en-IN')}` : 'Free';
  const startDateTime = event.startDateTime
    ? new Date(event.startDateTime).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Date TBD';

  return (
    <div className="bg-white rounded-3xl border border-slate-100/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full">
      {/* Image */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={imgSrc}
          alt={event.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={handleImgError}
        />
        <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-sm uppercase tracking-wider">
          {event.sport || 'Sport'}
        </span>
      </div>

      {/* Info Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2">
            {event.title}
          </h3>
          <p className="text-xs text-slate-505 font-medium line-clamp-1">
            🏟️ {event.stadium?.name || event.stadiumName || 'Stadium Arena'}
          </p>
          <p className="text-xs text-slate-500 font-medium">
            📅 {startDateTime}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400">Tickets from</span>
            <span className="text-base font-extrabold text-blue-600">{price}</span>
          </div>
          <Link
            to={`/events/${eventId}`}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-slate-950/10"
          >
            Book Tickets
          </Link>
        </div>
      </div>
    </div>
  );
}
