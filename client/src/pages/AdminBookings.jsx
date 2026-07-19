import React, { useEffect, useState, useCallback } from 'react';
import { FiSearch, FiFilter, FiBookmark, FiUser, FiCalendar, FiMapPin } from 'react-icons/fi';
import { getBookingsAdmin } from '../services/admin.service';
import useApiState from '../hooks/useApiState';
import usePagination from '../hooks/usePagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';

function StatusBadge({ status }) {
  const map = {
    confirmed: 'bg-green-50 text-green-700 border-green-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    cancelled: 'bg-red-50 text-red-600 border-red-200',
    paid: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    failed: 'bg-red-50 text-red-600 border-red-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border capitalize ${map[status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
      {status}
    </span>
  );
}

function BookingRow({ booking }) {
  const dateStr = booking.bookedAt
    ? new Date(booking.bookedAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'TBA';

  const user = booking.user;
  const event = booking.event;

  return (
    <tr className="border-b border-gray-100 hover:bg-slate-50/50 transition">
      <td className="py-3.5 px-4">
        <span className="font-mono text-sm font-bold text-slate-800">{booking.bookingNumber}</span>
      </td>
      <td className="py-3.5 px-4 text-sm text-gray-700">
        <div>
          <p className="font-bold text-slate-800">{user?.name || 'Attendee User'}</p>
          <p className="text-xs text-gray-400 font-semibold">{user?.email}</p>
        </div>
      </td>
      <td className="py-3.5 px-4 text-sm text-gray-700">
        <div>
          <p className="font-bold text-slate-800 truncate max-w-xs">{event?.title || 'Unknown Event'}</p>
          <p className="text-xs text-gray-450 mt-0.5 flex items-center gap-1 font-semibold">
            <FiMapPin size={11} className="text-emerald-500" />
            {event?.stadium?.name || 'Arena Venue'}
          </p>
        </div>
      </td>
      <td className="py-3.5 px-4 text-sm text-slate-500 font-semibold tabular-nums">
        {booking.quantity}
      </td>
      <td className="py-3.5 px-4 text-sm text-slate-800 font-bold tabular-nums">
        ₹{booking.totalAmount}
      </td>
      <td className="py-3.5 px-4">
        <div className="flex flex-col sm:flex-row items-start gap-1">
          <StatusBadge status={booking.bookingStatus} />
          <StatusBadge status={booking.paymentStatus} />
        </div>
      </td>
      <td className="py-3.5 px-4 text-xs text-gray-500 font-semibold">
        {dateStr}
      </td>
    </tr>
  );
}

export default function AdminBookings() {
  const api = useApiState(null);
  const { currentPage, setCurrentPage, totalPages, setTotalPages } = usePagination(1, 1);
  const [statusFilter, setStatusFilter] = useState(''); // '', 'confirmed', 'pending', 'cancelled'

  const loadBookings = useCallback(async () => {
    api.setLoading(true);
    try {
      const res = await getBookingsAdmin(currentPage, 12, statusFilter || undefined);
      api.setData(res.data);
      api.setError(null);
      const meta = res.data?.meta;
      setTotalPages(meta ? Math.ceil((meta.total || 0) / (meta.limit || 12)) : 1);
    } catch (err) {
      api.setError(err);
    } finally {
      api.setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter]);

  useEffect(() => { loadBookings(); }, [loadBookings]);
  useEffect(() => { setCurrentPage(1); }, [statusFilter, setCurrentPage]);

  const bookings = api.data?.data || [];
  const isEmpty = !api.loading && bookings.length === 0;

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Booking & Sales Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">Inspect all transaction receipts, seats reservation quantities, and checkout status</p>
      </div>

      {/* Tabs / Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-1">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {[
            { id: '', label: 'All Bookings' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'pending', label: 'Pending' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table grid card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {api.loading && (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner />
          </div>
        )}

        {api.error && !api.loading && (
          <div className="p-6 text-center text-red-600 text-sm font-semibold">
            Error loading bookings database.{' '}
            <button onClick={loadBookings} className="underline text-blue-600 font-bold">Retry</button>
          </div>
        )}

        {isEmpty && !api.error && (
          <EmptyState
            title="No bookings found"
            description={statusFilter ? `No bookings with status "${statusFilter}" were registered.` : 'No ticket purchases are registered yet.'}
          />
        )}

        {!api.loading && bookings.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Booking Code</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Attendee User</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Event Details</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Seats</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Paid Total</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status Badge</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Purchased At</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <BookingRow key={b.id || b._id} booking={b} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}
