import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getEvent } from '../services/event.service';
import { createBooking } from '../services/booking.service';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Booking() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  useEffect(() => {
    async function fetchEventDetails() {
      if (!eventId) {
        setError('No event was selected for booking.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await getEvent(eventId);
        setEvent(res?.data?.data?.event || res?.data?.data);
      } catch (err) {
        console.error('Error fetching booking event details:', err);
        setError('Failed to load event details. Please verify the link.');
      } finally {
        setLoading(false);
      }
    }
    fetchEventDetails();
  }, [eventId]);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!event || bookingLoading) return;
    setBookingLoading(true);
    setBookingError(null);
    try {
      const res = await createBooking({
        eventId: event.id || event._id,
        quantity: parseInt(quantity, 10)
      });
      const booking = res?.data?.data?.booking || res?.data?.booking;
      if (booking && (booking.id || booking._id)) {
        const id = booking.id || booking._id;
        // Redirect to payment step
        navigate(`/payment?bookingId=${id}`);
      } else {
        throw new Error('Booking response invalid');
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      setBookingError(err?.response?.data?.message || 'Failed to place booking. Please check seat availability.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-slate-500 font-medium">Preparing booking details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-red-50 border border-red-200 text-red-700 rounded-3xl text-center space-y-4">
        <p className="font-semibold">{error || 'Event information is missing.'}</p>
        <Link to="/events" className="inline-block px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm">
          Browse Events
        </Link>
      </div>
    );
  }

  const maxAllowedTickets = Math.min(event.availableSeats || 0, 10); // cap at 10 tickets per order or available seats
  const totalPrice = quantity * (event.price || 0);

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">Confirm Your Booking</h1>
        <p className="text-sm text-slate-500 mt-1">Review the match details and select the number of tickets you wish to purchase.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
        {/* Event Details Summary Card */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">Event Summary</h2>
            <div className="space-y-3">
              <h3 className="font-extrabold text-slate-800 text-xl leading-snug">{event.title}</h3>
              <p className="text-sm text-slate-500 font-semibold">Stadium: {event.stadium?.name || event.stadiumName || 'Arena Venue'}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-slate-400 uppercase pt-2">
                <span>📅 Date: <strong className="text-slate-700">
                  {event.startDateTime
                    ? new Date(event.startDateTime).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                    : 'TBA'}
                </strong></span>
                <span>⏱️ Sport: <strong className="text-slate-700">{event.sport}</strong></span>
              </div>
            </div>
          </div>

          {/* Pricing Info Card */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/60 space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900">Seat Availability</h2>
            <div className="flex justify-between items-center text-sm font-semibold text-slate-600">
              <span>Gate Tickets Remaining:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${event.availableSeats < 15 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                {event.availableSeats} Seats Left
              </span>
            </div>
          </div>
        </div>

        {/* Ticket Selector Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmitBooking} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg space-y-6 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
            
            <h2 className="text-lg font-extrabold text-slate-950">Select Tickets</h2>
            
            {event.availableSeats === 0 ? (
              <div className="p-4 bg-red-50 text-red-700 font-bold text-sm text-center rounded-xl">
                This match is fully booked (Sold Out).
              </div>
            ) : (
              <>
                {/* Quantity Input */}
                <div className="space-y-2">
                  <label htmlFor="quantity" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Number of Tickets</label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                  >
                    {[...Array(maxAllowedTickets)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} Ticket{i > 0 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400">Max. 10 tickets per order for safety compliance.</p>
                </div>

                {/* Total Summary */}
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400 font-semibold uppercase">
                    <span>Base Price</span>
                    <span>₹{event.price} × {quantity}</span>
                  </div>
                  <div className="flex justify-between items-end border-t border-slate-50 pt-2">
                    <span className="text-sm font-bold text-slate-800">Total Price</span>
                    <span className="text-2xl font-extrabold text-slate-900">₹{totalPrice}</span>
                  </div>
                </div>

                {bookingError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 font-medium text-xs rounded-xl text-center">
                    {bookingError}
                  </div>
                )}

                {/* Confirm Button */}
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg transition-all transform hover:-translate-y-0.5 text-center flex items-center justify-center uppercase tracking-wider text-xs"
                >
                  {bookingLoading ? <LoadingSpinner size="sm" /> : 'Confirm Booking'}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}