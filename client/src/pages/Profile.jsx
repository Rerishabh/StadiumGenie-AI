import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getUserBookings, cancelBooking } from '../services/booking.service';
import { updateProfile } from '../services/auth.service';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
];

// Phone validation: must be empty or a valid phone number (digits, spaces, +, -, parens, 7-15 chars)
function isValidPhone(phone) {
  if (!phone || phone.trim() === '') return true; // optional
  return /^[+]?[\d\s\-().]{7,15}$/.test(phone.trim());
}

export default function Profile() {
  const { user, refreshUser } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingError, setBookingError] = useState(null);

  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Booking history tab selection: 'upcoming' | 'past' | 'cancelled'
  const [activeTab, setActiveTab] = useState('upcoming');
  // Cancellation feedback
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState('');
  // Inline confirm state: stores the bookingId awaiting confirmation, or null
  const [cancelConfirmId, setCancelConfirmId] = useState(null);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
      setEditAvatar(user.profileImage || '');
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    async function fetchBookings() {
      try {
        setLoadingBookings(true);
        setBookingError(null);
        const pageSize = 100;
        let page = 1;
        let allBookings = [];
        let total = null;
        do {
          // eslint-disable-next-line no-await-in-loop
          const res = await getUserBookings({ page, limit: pageSize });
          const data = res?.data?.data || res?.data || [];
          const meta = res?.data?.meta || {};
          allBookings = allBookings.concat(Array.isArray(data) ? data : []);
          total = Number.isFinite(meta.total) ? meta.total : allBookings.length;
          page += 1;
        } while (allBookings.length < total);
        if (!cancelled) setBookings(allBookings);
      } catch (err) {
        if (cancelled) return;
        console.error('Error fetching user bookings:', err);
        setBookingError('Could not retrieve booking history.');
      } finally {
        if (!cancelled) setLoadingBookings(false);
      }
    }
    if (user) {
      fetchBookings();
    }
    return () => { cancelled = true; };
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    // Phone validation
    if (!isValidPhone(editPhone)) {
      setPhoneError('Please enter a valid phone number (e.g. +91 9876543210) or leave blank.');
      return;
    }
    setPhoneError('');
    setProfileError('');

    setUpdatingProfile(true);
    setProfileSuccess(false);
    try {
      await updateProfile({
        name: editName.trim(),
        phone: editPhone.trim(),
        profileImage: editAvatar,
      });
      await refreshUser(); // updates local context state
      setProfileSuccess(true);
      setTimeout(() => {
        setProfileSuccess(false);
        setIsEditing(false);
      }, 1800);
    } catch (err) {
      console.error('Failed to update profile:', err);
      const msg = err?.response?.data?.message || 'Failed to update profile. Please try again.';
      setProfileError(msg);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    // Use inline confirmation instead of window.confirm
    setCancelConfirmId(bookingId);
  };

  const confirmCancelBooking = async (bookingId) => {
    setCancelConfirmId(null);
    setCancelError('');
    setCancelSuccess('');
    try {
      await cancelBooking(bookingId);
      // Update state locally so tab counts refresh immediately
      setBookings(prev =>
        prev.map(b => (b.id === bookingId || b._id === bookingId ? { ...b, bookingStatus: 'cancelled', paymentStatus: b.paymentStatus === 'paid' ? 'refunded' : b.paymentStatus } : b))
      );
      setCancelSuccess('Booking cancelled successfully.');
      setTimeout(() => setCancelSuccess(''), 3000);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setCancelError(err?.response?.data?.message || 'Failed to cancel booking. Please try again.');
      setTimeout(() => setCancelError(''), 4000);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-slate-50 rounded-3xl border border-slate-200">
        <p className="text-slate-600 font-medium">Please sign in to view your profile.</p>
        <Link to="/login" className="inline-block mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm">
          Sign In
        </Link>
      </div>
    );
  }

  // Segment bookings into sections
  const now = new Date();
  const upcomingBookings = bookings.filter(b => {
    if (b.bookingStatus === 'cancelled') return false;
    // Events without a date go to upcoming by default
    const matchTime = b.event?.startDateTime ? new Date(b.event.startDateTime) : null;
    if (!matchTime) return true; // no date = show in upcoming
    return matchTime >= now;
  });

  const pastBookings = bookings.filter(b => {
    if (b.bookingStatus === 'cancelled') return false;
    const matchTime = b.event?.startDateTime ? new Date(b.event.startDateTime) : null;
    if (!matchTime) return false; // no date goes to upcoming
    return matchTime < now;
  });

  const cancelledBookings = bookings.filter(b => b.bookingStatus === 'cancelled');

  const getFilteredBookings = () => {
    const bookingDate = (booking) => new Date(booking.event?.startDateTime || booking.bookedAt || 0).getTime();
    if (activeTab === 'upcoming') return [...upcomingBookings].sort((a, b) => bookingDate(a) - bookingDate(b));
    if (activeTab === 'past') return [...pastBookings].sort((a, b) => bookingDate(b) - bookingDate(a));
    return [...cancelledBookings].sort((a, b) => bookingDate(b) - bookingDate(a));
  };

  const filteredList = getFilteredBookings();

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-6 px-4">
      {/* Profile Card / Edit Card */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100/80 shadow-sm transition-all duration-200">
        {!isEditing ? (
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="h-20 w-20 rounded-2xl object-cover shadow-md border border-slate-100 shrink-0"
                />
              ) : (
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-blue-500/10 shrink-0 uppercase">
                  {user.name ? user.name.slice(0, 2) : 'SG'}
                </div>
              )}
              <div className="space-y-1 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{user.name || 'Genie User'}</h1>
                <p className="text-slate-400 font-semibold text-sm">{user.email}</p>
                <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold bg-blue-50 text-blue-700 border border-blue-100 capitalize">
                    {user.role || 'Attendee'}
                  </span>
                  {user.phone && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-150 flex items-center gap-1">
                      📞 {user.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => { setIsEditing(true); setProfileError(''); setPhoneError(''); }}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow-sm shrink-0 uppercase tracking-wider"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <h2 className="text-xl font-extrabold text-slate-950">Edit Profile</h2>

            {/* Avatar Selectors */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Avatar Profile</label>
              <div className="flex flex-wrap gap-3 items-center">
                <button
                  type="button"
                  onClick={() => setEditAvatar('')}
                  className={`h-14 w-14 rounded-2xl font-bold border flex items-center justify-center text-xs transition-all ${
                    !editAvatar ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Initials
                </button>
                {AVATAR_OPTIONS.map((avatar, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setEditAvatar(avatar)}
                    className={`h-14 w-14 rounded-2xl overflow-hidden border transition-all ${
                      editAvatar === avatar ? 'border-blue-600 ring-2 ring-blue-600 scale-95 shadow-md' : 'border-slate-200 hover:scale-95'
                    }`}
                  >
                    <img src={avatar} alt="Avatar option" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Phone Number <span className="text-slate-300 normal-case">(optional)</span></label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={editPhone}
                  onChange={(e) => { setEditPhone(e.target.value); setPhoneError(''); }}
                  className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 text-slate-800 text-sm font-semibold outline-none focus:bg-white transition-colors ${phoneError ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                />
                {phoneError && <p className="text-xs text-red-500 font-semibold mt-1">{phoneError}</p>}
              </div>
            </div>

            {/* Message states */}
            {profileSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-xl text-center">
                ✓ Profile updated successfully!
              </div>
            )}
            {profileError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl text-center">
                ⚠️ {profileError}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={updatingProfile}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md uppercase tracking-wider flex items-center justify-center shrink-0 min-w-[120px]"
              >
                {updatingProfile ? <LoadingSpinner size="sm" /> : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditName(user.name || '');
                  setEditPhone(user.phone || '');
                  setEditAvatar(user.profileImage || '');
                  setProfileError('');
                  setPhoneError('');
                }}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all uppercase tracking-wider"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Cancellation feedback toast */}
      {(cancelSuccess || cancelError) && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl text-sm font-bold text-white transition-all ${cancelSuccess ? 'bg-green-600' : 'bg-red-600'}`}>
          {cancelSuccess || cancelError}
        </div>
      )}

      {/* Booking History Segment */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-100 pb-2">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Your Booking History</h2>
            <p className="text-xs text-slate-500 mt-1">Review upcoming events, cancellations, and order receipts.</p>
          </div>

          {/* Group Tabs */}
          <div className="flex gap-2">
            {[
              { id: 'upcoming', label: `Upcoming (${upcomingBookings.length})` },
              { id: 'past', label: `Past (${pastBookings.length})` },
              { id: 'cancelled', label: `Cancelled (${cancelledBookings.length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loadingBookings ? (
          <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-slate-100">
            <LoadingSpinner size="md" />
            <p className="text-slate-500 text-sm mt-3 animate-pulse">Retrieving your ticket bookings...</p>
          </div>
        ) : bookingError ? (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-center text-sm font-semibold">
            {bookingError}
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-16 bg-white rounded-3xl border border-dashed text-center space-y-4">
            <span className="text-4xl block">📋</span>
            <p className="text-slate-550 font-bold text-sm">No bookings in this category.</p>
            {activeTab === 'upcoming' && (
              <Link to="/events" className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md uppercase tracking-wider">
                Find Matches &rarr;
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredList.map((booking) => {
              const bId = booking.id || booking._id;
              const isCancelled = booking.bookingStatus === 'cancelled';
              const isConfirmed = booking.bookingStatus === 'confirmed';
              const isPaid = booking.paymentStatus === 'paid';
              const isPending = booking.paymentStatus === 'pending';

              const matchDateStr = booking.event?.startDateTime
                ? new Date(booking.event.startDateTime).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Date TBD';

              return (
                <div key={bId} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-shadow">
                  <div className="space-y-2.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-500 font-bold bg-slate-50 px-2 py-0.5 rounded border">
                        {booking.bookingNumber || `BK-${bId.substring(0, 8).toUpperCase()}`}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                        isConfirmed ? 'bg-green-50 text-green-700 border-green-100' :
                        isCancelled ? 'bg-red-50 text-red-650 border-red-105' :
                        'bg-yellow-50 text-yellow-750 border-yellow-105'
                      }`}>
                        Status: {booking.bookingStatus || 'pending'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                        isPaid ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        isPending ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                        'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        Payment: {booking.paymentStatus || 'unpaid'}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-lg leading-snug truncate">
                      {booking.event?.title || 'Sport Event'}
                    </h3>
                    <p className="text-slate-500 text-xs font-semibold flex items-center gap-1">
                      🏟️ Venue: {booking.event?.stadium?.name || 'Stadium Arena'}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-slate-500 font-semibold pt-1">
                      <span>🎟️ Qty: <strong className="text-slate-800">{booking.quantity}</strong></span>
                      <span>💰 Total: <strong className="text-slate-850">₹{booking.totalAmount?.toLocaleString('en-IN')}</strong></span>
                      <span>📅 Match Time: <strong className="text-slate-800">{matchDateStr}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5 shrink-0 w-full md:w-auto">
                    {/* View Entry Passes direct link */}
                    {isConfirmed && (
                      <Link
                        to="/tickets"
                        className="flex-1 md:flex-none px-4.5 py-2.5 bg-slate-950 hover:bg-slate-850 text-white font-bold rounded-xl text-xs transition-all text-center uppercase tracking-wider shadow-sm shadow-slate-950/10"
                      >
                        🎟️ View Entry Passes
                      </Link>
                    )}

                    {/* Pay Now link for cash/pending bookings */}
                    {isConfirmed && isPending && (
                      <Link
                        to={`/payment?bookingId=${bId}`}
                        className="flex-1 md:flex-none px-4.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all text-center uppercase tracking-wider shadow-sm"
                      >
                        💳 Pay Now
                      </Link>
                    )}

                    {/* Cancel Booking Button / Inline Confirm */}
                    {!isCancelled && activeTab === 'upcoming' && (
                      cancelConfirmId === bId ? (
                        <div className="flex gap-2 items-center">
                          <button
                            id={`confirm-cancel-${bId}`}
                            onClick={() => confirmCancelBooking(bId)}
                            className="flex-1 md:flex-none px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all text-center uppercase tracking-wider shadow-sm"
                          >
                            Confirm Cancel
                          </button>
                          <button
                            id={`keep-booking-${bId}`}
                            onClick={() => setCancelConfirmId(null)}
                            className="flex-1 md:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all text-center uppercase tracking-wider"
                          >
                            Keep Booking
                          </button>
                        </div>
                      ) : (
                        <button
                          id={`cancel-booking-${bId}`}
                          onClick={() => handleCancelBooking(bId)}
                          className="flex-1 md:flex-none px-4.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 font-bold rounded-xl text-xs transition-all text-center uppercase tracking-wider"
                        >
                          Cancel Booking
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
