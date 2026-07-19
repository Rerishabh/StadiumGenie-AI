import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiMapPin, FiUsers } from 'react-icons/fi';
import { getAllStadiums, deleteStadium } from '../services/stadium.service';
import useApiState from '../hooks/useApiState';
import usePagination from '../hooks/usePagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';

/* ------------------------------------------------------------------ */
/* Delete Confirmation Dialog                                           */
/* ------------------------------------------------------------------ */
function DeleteDialog({ stadium, onCancel, onConfirm, loading }) {
  if (!stadium) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-fade-in">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Stadium</h2>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete <span className="font-semibold text-gray-800">{stadium.name}</span>?
          This action cannot be undone.
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

/* ------------------------------------------------------------------ */
/* Stadium Row                                                          */
/* ------------------------------------------------------------------ */
function StadiumRow({ stadium, onEdit, onDelete }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/40 transition">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          {stadium.imageUrl ? (
            <img src={stadium.imageUrl} alt={stadium.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 font-bold text-lg">
              {stadium.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900 text-sm">{stadium.name}</p>
            <p className="text-xs text-gray-500">{stadium.slug}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-gray-600">
        <span className="flex items-center gap-1"><FiMapPin className="text-blue-400" size={12} />{stadium.city}{stadium.country ? `, ${stadium.country}` : ''}</span>
      </td>
      <td className="py-3 px-4 text-sm text-gray-600">
        <span className="flex items-center gap-1"><FiUsers className="text-blue-400" size={12} />{stadium.capacity?.toLocaleString()}</span>
      </td>
      <td className="py-3 px-4 text-sm text-gray-500">
        {(stadium.facilities || []).slice(0, 2).map((f) => (
          <span key={f} className="inline-block bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs mr-1">{f}</span>
        ))}
        {(stadium.facilities || []).length > 2 && (
          <span className="inline-block text-xs text-gray-400">+{stadium.facilities.length - 2} more</span>
        )}
      </td>
      <td className="py-3 px-4">
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${stadium.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {stadium.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(stadium)}
            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-100 transition"
            title="Edit"
          >
            <FiEdit2 size={15} />
          </button>
          <button
            onClick={() => onDelete(stadium)}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
            title="Delete"
          >
            <FiTrash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/* Main Page                                                            */
/* ------------------------------------------------------------------ */
export default function AdminStadiums() {
  const navigate = useNavigate();
  const api = useApiState(null);
  const { currentPage, setCurrentPage, totalPages, setTotalPages } = usePagination(1, 1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  // Debounce search by 350ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const loadStadiums = useCallback(async () => {
    api.setLoading(true);
    try {
      const res = await getAllStadiums({ q: debouncedSearch || undefined, page: currentPage, limit: 10 });
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

  useEffect(() => { loadStadiums(); }, [loadStadiums]);

  // Reset to page 1 on search change
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, setCurrentPage]);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteStadium(deleteTarget.id || deleteTarget._id);
      setDeleteTarget(null);
      showToast('success', `"${deleteTarget.name}" deleted successfully.`);
      loadStadiums();
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Failed to delete stadium.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const stadiums = api.data?.data || [];
  const isEmpty = !api.loading && stadiums.length === 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stadium Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create, edit, and manage all stadiums</p>
        </div>
        <Link
          to="/admin/stadiums/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          <FiPlus size={16} /> Add Stadium
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="search"
          placeholder="Search by name or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
        />
      </div>

      {/* Toast */}
      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {toast.msg}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {api.loading && (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner />
          </div>
        )}

        {api.error && !api.loading && (
          <div className="p-6 text-center text-red-600 text-sm">
            Error loading stadiums.{' '}
            <button onClick={loadStadiums} className="underline text-blue-600">Retry</button>
          </div>
        )}

        {isEmpty && !api.error && (
          <EmptyState
            title="No stadiums found"
            description={debouncedSearch ? `No results for "${debouncedSearch}".` : 'Get started by adding your first stadium.'}
            actionText="Add Stadium"
            onAction={() => navigate('/admin/stadiums/new')}
          />
        )}

        {!api.loading && stadiums.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stadium</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Capacity</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Facilities</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stadiums.map((s) => (
                  <StadiumRow
                    key={s.id || s._id}
                    stadium={s}
                    onEdit={(st) => navigate(`/admin/stadiums/${st.id || st._id}/edit`)}
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

      {/* Delete Dialog */}
      <DeleteDialog
        stadium={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
