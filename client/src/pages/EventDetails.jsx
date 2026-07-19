import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useApiState from '../hooks/useApiState';
import { getEvent } from '../services/event.service';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { resolveEventImage, getEventFallbackForEvent, DEFAULT_EVENT_FALLBACK } from '../utils/imageResolver';

export default function EventDetails() {
  const { id } = useParams();
  const eventState = useApiState(null);
  const [imgSrc, setImgSrc] = useState('');

  useEffect(() => {
    let mounted = true;
    async function fetch() {
      eventState.setLoading(true);
      try {
        const res = await getEvent(id);
        if (!mounted) return;
        eventState.setData(res.data);
        eventState.setError(null);
      } catch (err) {
        if (!mounted) return;
        eventState.setError(err);
      } finally {
        if (!mounted) return;
        eventState.setLoading(false);
      }
    }
    fetch();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const ev = eventState.data?.data?.event || eventState.data?.data;

  useEffect(() => {
    if (ev) {
      setImgSrc(resolveEventImage(ev));
    }
  }, [ev]);

  const handleImgError = () => {
    if (!ev) return;
    const sportFallback = getEventFallbackForEvent(ev);
    if (imgSrc !== sportFallback) {
      setImgSrc(sportFallback);
    } else if (imgSrc !== DEFAULT_EVENT_FALLBACK) {
      setImgSrc(DEFAULT_EVENT_FALLBACK);
    }
  };

  if (eventState.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-slate-500 font-medium">Retrieving event details...</p>
      </div>
    );
  }

  if (eventState.error) {
    return (
      <div className="max-w-md mx-auto my-12 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-center">
        Error loading event details. Please verify the ID or try again.
      </div>
    );
  }

  if (!ev) return <EmptyState title="Event not found" description="The requested sports match details could not be found." />;

  const isSoldOut = ev.availableSeats === 0;
  const isCancelled = ev.status === 'cancelled';

  // Format date and time
  const eventDate = ev.startDateTime ? new Date(ev.startDateTime) : null;
  const formattedDate = eventDate ? eventDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ev.date || 'To be announced';
  const formattedTime = eventDate ? eventDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'TBA';

  const seatsLeftPercent = ev.totalSeats ? Math.round((ev.availableSeats / ev.totalSeats) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8">
      {/* Back Button */}
      <Link to="/events" className="text-sm font-semibold text-blue-600 hover:text-blue-500 inline-flex items-center gap-1">
        &larr; Back to all matches
      </Link>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Banner Image */}
          <div className="relative rounded-3xl overflow-hidden shadow-sm aspect-[16/9] border border-slate-100 bg-slate-900">
            <img
              src={imgSrc || DEFAULT_EVENT_FALLBACK}
              alt={ev.title}
              className="w-full h-full object-cover"
              onError={handleImgError}
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-sm capitalize">
                ⚽ {ev.sport || 'Sports'}
              </span>
              {isCancelled && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-sm uppercase">
                  Cancelled
                </span>
              )}
              {isSoldOut && !isCancelled && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white shadow-sm uppercase">
                  Sold Out
                </span>
              )}
            </div>
          </div>

          {/* Description & Venue info */}
          <div className="space-y-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight leading-snug">{ev.title}</h1>
            <div className="border-t border-slate-100 pt-4 space-y-3 text-slate-600 text-sm">
              <p className="text-base leading-relaxed">{ev.description || 'No description available.'}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Booking Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg space-y-6 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
            
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket Price</span>
              <p className="text-3xl font-extrabold text-slate-900">₹{ev.price || '0'}</p>
            </div>

            {/* Event Meta Info List */}
            <div className="space-y-4 border-y border-slate-100 py-5">
              <div className="flex items-start gap-3">
                <span className="text-lg">📅</span>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Match Date</p>
                  <p className="text-sm font-semibold text-slate-800">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-lg">⏰</span>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Kick-off Time</p>
                  <p className="text-sm font-semibold text-slate-800">{formattedTime}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-lg">🏟️</span>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Stadium Arena</p>
                  <Link to={`/stadiums/${ev.stadiumId || ev.stadium?._id}`} className="text-sm font-semibold text-blue-600 hover:underline">
                    {ev.stadium?.name || ev.stadiumName || 'Arena Venue'}
                  </Link>
                  <p className="text-xs text-slate-500">{ev.stadium?.city || ev.city}</p>
                </div>
              </div>
            </div>

            {/* Seat Capacity Bar */}
            {!isCancelled && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Available Seats</span>
                  <span className={isSoldOut ? 'text-red-600' : 'text-blue-600'}>
                    {ev.availableSeats} / {ev.totalSeats || 'TBA'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isSoldOut ? 'bg-red-500' : seatsLeftPercent < 15 ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${seatsLeftPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Booking CTAs */}
            {isCancelled ? (
              <button
                className="w-full py-3.5 rounded-xl font-bold bg-slate-150 text-slate-400 border border-slate-200 cursor-not-allowed text-center uppercase tracking-wider text-sm"
                disabled
              >
                Match Cancelled
              </button>
            ) : isSoldOut ? (
              <button
                className="w-full py-3.5 rounded-xl font-bold bg-slate-900 text-slate-400 cursor-not-allowed text-center uppercase tracking-wider text-sm"
                disabled
              >
                Sold Out
              </button>
            ) : (
              <Link
                to={`/booking?eventId=${ev.id || ev._id}`}
                className="block w-full py-3.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white text-center shadow-md shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 uppercase tracking-wider text-sm"
              >
                Book Tickets Now
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
