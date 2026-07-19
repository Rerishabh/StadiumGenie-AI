import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiCalendar, FiMapPin, FiMap } from 'react-icons/fi';
import { getAllEvents, deleteEvent } from '../services/event.service';
import useApiState from '../hooks/useApiState';
import usePagination from '../hooks/usePagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';

function DeleteDialog({ event, onCancel, onConfirm, loading }) {
  if (!event) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-fade-in">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Event</h2>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete <span className="font-semibold text-gray-800">{event.title}</span>?
          This action cannot be undone and will fail if active bookings exist.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition disabled:opacity-60 flex items-center gap-2"
          >
            {loading ? <LoadingSpinner size="sm" /> : <FiTrash2 />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function EventRow({ item, onEdit, onDelete }) {
  const dateStr = item.startDateTime
    ? new Date(item.startDateTime).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'TBA';

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/40 transition">
      <td className="py-3.5 px-4">
        <div className="min-w-0">
          <p className="font-bold text-gray-900 text-sm truncate">{item.title}</p>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">{item.sport} · {item.organizer || 'StadiumGenie'}</p>
        </div>
      </td>
      <td className="py-3.5 px-4 text-sm text-gray-600">
        <span className="flex items-center gap-1.5 font-semibold">
          <FiCalendar className="text-blue-500" size={14} />
          {dateStr}
        </span>
      </td>
      <td className="py-3.5 px-4 text-sm text-gray-600">
        <span className="flex items-center gap-1.5">
          <FiMapPin className="text-emerald-500" size={14} />
          {item.stadium?.name || 'Arena Venue'}
        </span>
      </td>
      <td className="py-3.5 px-4 text-sm text-gray-700 font-bold tabular-nums">
        ₹{item.price}
      </td>
      <td className="py-3.5 px-4 text-sm text-gray-600">
        <div className="text-xs font-bold text-slate-500">
          {item.availableSeats} / {item.totalSeats} <span className="text-gray-400 font-normal">left</span>
        </div>
      </td>
      <td className="py-3.5 px-4">
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${
          item.status === 'scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200' :
          item.status === 'live' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' :
          item.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
          'bg-red-50 text-red-700 border-red-200'
        }`}>
          {item.status}
        </span>
      </td>
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-100 transition cursor-pointer"
            title="Edit"
          >
            <FiEdit2 size={15} />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition cursor-pointer"
            title="Delete"
          >
            <FiTrash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminEvents() {
  const navigate = useNavigate();
  const api = useApiState(null);
  const { currentPage, setCurrentPage, totalPages, setTotalPages } = usePagination(1, 1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const loadEvents = useCallback(async () => {
    api.setLoading(true);
    try {
      const res = await getAllEvents({
        q: debouncedSearch || undefined,
        page: currentPage,
        limit: 10,
        // retrieve all events for admin portal management
      });
      api.setData(res.data);
      api.setError(null);
      const meta = res.data?.meta;
      setTotalPages(meta ? Math.ceil((meta.total || 0) / (meta.limit || 10)) : 1);
    } catch (err) {
      api.setError(err);
    } finally {
      api.setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearch]);

  useEffect(() => { loadEvents(); }, [loadEvents]);
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, setCurrentPage]);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteEvent(deleteTarget.id || deleteTarget._id);
      setDeleteTarget(null);
      showToast('success', `Event "${deleteTarget.title}" deleted successfully.`);
      loadEvents();
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Failed to delete event.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const events = api.data?.data || [];
  const isEmpty = !api.loading && events.length === 0;

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage schedules, price lists, and bookings capacity</p>
        </div>
        <Link
          to="/admin/events/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          <FiPlus size={16} /> Add Event
        </Link>
      </div>

      {/* Search bar */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="search"
          placeholder="Search by event title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
        />
      </div>

      {/* Toast popup */}
      {toast && (
        <div className={`px-4 py-3 rounded-xl text-sm font-semibold border ${
          toast.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Table grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {api.loading && (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner />
          </div>
        )}

        {api.error && !api.loading && (
          <div className="p-6 text-center text-red-600 text-sm font-medium">
            Error loading events schedule list.{' '}
            <button onClick={loadEvents} className="underline font-bold text-blue-600">Retry</button>
          </div>
        )}

        {isEmpty && !api.error && (
          <EmptyState
            title="No events found"
            description={debouncedSearch ? `No scheduled events match "${debouncedSearch}".` : 'Get started by creating your first match event.'}
            actionText="Add Event"
            onAction={() => navigate('/admin/events/new')}
          />
        )}

        {!api.loading && events.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Event Details</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Match Date & Time</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Venue Stadium</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Available Seats</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <EventRow
                    key={e.id || e._id}
                    item={e}
                    onEdit={(item) => navigate(`/admin/events/${item.id || item._id}/edit`)}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {/* Delete Confirmation popup */}
      <DeleteDialog
        event={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
