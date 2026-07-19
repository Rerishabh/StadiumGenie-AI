import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { resolveStadiumImage, getStadiumFallback, DEFAULT_STADIUM_FALLBACK } from '../../utils/imageResolver';

export default function StadiumCard({ stadium }) {
  const initialImage = resolveStadiumImage(stadium);
  const [imgSrc, setImgSrc] = useState(initialImage);

  // Cards can be reused by React as filters and pagination change. Reset the
  // image state when the displayed stadium changes instead of retaining a prior
  // card's failed URL/fallback.
  useEffect(() => {
    setImgSrc(initialImage);
  }, [initialImage]);

  if (!stadium) return null;

  const stadiumId = stadium.id || stadium._id;
  const sports = stadium.sportsSupported || stadium.sports || [];

  const handleImgError = () => {
    const fallback = getStadiumFallback(stadium);
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    } else if (imgSrc !== DEFAULT_STADIUM_FALLBACK) {
      setImgSrc(DEFAULT_STADIUM_FALLBACK);
    }
  };

  return (
    <div className="group bg-white rounded-3xl border border-slate-100/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full">
      {/* Cover Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={imgSrc}
          alt={stadium.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={handleImgError}
        />
        {/* Supported sports small badges inside image */}
        {sports.length > 0 && (
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/95 text-slate-800 backdrop-blur-sm shadow-sm">
              {sports[0]}
            </span>
            {sports.length > 1 && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-900/85 text-white backdrop-blur-sm shadow-sm">
                +{sports.length - 1}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Info Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-blue-600 transition-colors line-clamp-1">
            {stadium.name}
          </h3>
          <p className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            📍 {[stadium.city, stadium.country].filter(Boolean).join(', ')}
          </p>
          <div className="flex justify-between items-center text-xs text-slate-550 pt-2">
            <span>👥 Capacity:</span>
            <span className="font-bold text-slate-800">{stadium.capacity ? stadium.capacity.toLocaleString() : 'N/A'}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">Venue Profile</span>
          <Link
            to={`/stadiums/${stadiumId}`}
            className="text-xs font-bold text-blue-600 hover:text-blue-500 hover:underline flex items-center gap-0.5"
          >
            View Details &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
