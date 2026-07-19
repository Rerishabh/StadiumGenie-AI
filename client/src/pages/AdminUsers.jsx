import React, { useEffect, useState, useCallback } from 'react';
import { FiUser, FiMail, FiCalendar, FiShield } from 'react-icons/fi';
import { getUsersAdmin } from '../services/admin.service';
import useApiState from '../hooks/useApiState';
import usePagination from '../hooks/usePagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';

function RoleBadge({ role }) {
  const map = {
    admin: 'bg-indigo-50 text-indigo-700 border-indigo-250 font-bold',
    staff: 'bg-teal-50 text-teal-700 border-teal-200 font-semibold',
    attendee: 'bg-slate-50 text-slate-600 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border capitalize ${
      map[role] || 'bg-slate-50 text-slate-500 border-slate-200'
    }`}>
      <FiShield size={11} className="opacity-70" />
      {role}
    </span>
  );
}

function UserRow({ user }) {
  const dateStr = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  return (
    <tr className="border-b border-gray-100 hover:bg-slate-50/50 transition">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-100">
            {user.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{user.name || 'Anonymous User'}</p>
            <p className="text-xs text-gray-400 font-semibold">id: {user.id}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 text-sm text-gray-700">
        <span className="flex items-center gap-1.5 font-semibold text-slate-700">
          <FiMail className="text-gray-400" size={13} />
          {user.email}
        </span>
      </td>
      <td className="py-4 px-4">
        <RoleBadge role={user.role} />
      </td>
      <td className="py-4 px-4 text-xs text-gray-500 font-semibold">
        {dateStr}
      </td>
      <td className="py-4 px-4">
        <span className={`inline-block w-2.5 h-2.5 rounded-full ${user.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} title={user.isActive ? 'Active session' : 'Disabled'} />
      </td>
    </tr>
  );
}

export default function AdminUsers() {
  const api = useApiState(null);
  const { currentPage, setCurrentPage, totalPages, setTotalPages } = usePagination(1, 1);

  const loadUsers = useCallback(async () => {
    api.setLoading(true);
    try {
      const res = await getUsersAdmin(currentPage, 12);
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
  }, [currentPage]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const users = api.data?.data || [];
  const isEmpty = !api.loading && users.length === 0;

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User & Staff Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">View user roles and trace account creation timestamps</p>
      </div>

      {/* Users table list */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {api.loading && (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner />
          </div>
        )}

        {api.error && !api.loading && (
          <div className="p-6 text-center text-red-600 text-sm font-semibold">
            Error loading users registry.{' '}
            <button onClick={loadUsers} className="underline text-blue-600 font-bold">Retry</button>
          </div>
        )}

        {isEmpty && !api.error && (
          <EmptyState
            title="No registered users found"
            description="The system has no accounts registered under this collection."
          />
        )}

        {!api.loading && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Account name</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">System Role</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Registered Date</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <UserRow key={u.id || u._id} user={u} />
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
