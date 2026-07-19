import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getDashboardSummary,
  getRecentBookings,
  getRecentPayments,
} from '../services/admin.service';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Stat card component
function StatCard({ label, value, icon, color, sub }) {
  return (
    <div className={`relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow`}>
      <div className={`absolute top-0 left-0 w-1.5 h-full rounded-l-2xl ${color}`} />
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 pl-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-3xl font-extrabold text-slate-900 tabular-nums">{value}</p>
          {sub && <p className="text-xs text-slate-500 font-medium">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${color.replace('bg-', 'bg-').replace('-600', '-50')} ${color.replace('bg-', 'text-')}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Mini badge for status
function StatusBadge({ status }) {
  const map = {
    confirmed: 'bg-green-50 text-green-700 border-green-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    cancelled: 'bg-red-50 text-red-600 border-red-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    failed: 'bg-red-50 text-red-600 border-red-200',
    paid: 'bg-blue-50 text-blue-700 border-blue-200',
    unpaid: 'bg-slate-50 text-slate-500 border-slate-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border capitalize ${map[status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
      {status}
    </span>
  );
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        const [summaryRes, bookingsRes, paymentsRes] = await Promise.all([
          getDashboardSummary(),
          getRecentBookings(8),
          getRecentPayments(8),
        ]);
        setSummary(summaryRes?.data?.data || null);
        setRecentBookings(bookingsRes?.data?.data || []);
        setRecentPayments(paymentsRes?.data?.data || []);
      } catch (err) {
        console.error('Admin dashboard load error:', err);
        setError('Failed to load dashboard data. Please refresh.');
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-slate-500 font-medium animate-pulse">Loading dashboard analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-center space-y-3">
        <p className="font-semibold">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  const formatCurrency = (n) =>
    typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '₹0';

  const statCards = [
    { label: 'Total Revenue', value: formatCurrency(summary?.totalRevenue), icon: '💰', color: 'bg-green-600', sub: 'From confirmed payments' },
    { label: 'Total Bookings', value: summary?.totalBookings ?? '—', icon: '🎟️', color: 'bg-blue-600', sub: `${summary?.totalSeatsBooked ?? 0} seats reserved` },
    { label: 'Registered Users', value: summary?.totalUsers ?? '—', icon: '👥', color: 'bg-violet-600', sub: 'All roles combined' },
    { label: 'Active Events', value: summary?.activeEvents ?? '—', icon: '⚽', color: 'bg-amber-500', sub: `${summary?.completedEvents ?? 0} completed · ${summary?.cancelledEvents ?? 0} cancelled` },
    { label: 'Active Stadiums', value: summary?.totalStadiums ?? '—', icon: '🏟️', color: 'bg-rose-500', sub: 'Live venue records' },
    { label: 'Tickets Issued', value: summary?.totalTickets ?? '—', icon: '📄', color: 'bg-cyan-600', sub: 'Generated entry passes' },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 font-medium">Real-time overview of StadiumGenie platform metrics and activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Event Status Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900">Event Status Breakdown</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Scheduled', count: summary?.activeEvents ?? 0, color: 'bg-blue-500', textColor: 'text-blue-700', bg: 'bg-blue-50' },
            { label: 'Completed', count: summary?.completedEvents ?? 0, color: 'bg-green-500', textColor: 'text-green-700', bg: 'bg-green-50' },
            { label: 'Cancelled', count: summary?.cancelledEvents ?? 0, color: 'bg-red-500', textColor: 'text-red-700', bg: 'bg-red-50' },
          ].map(({ label, count, color, textColor, bg }) => {
            const total = (summary?.totalEvents || 0) || 1;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={label} className={`rounded-2xl p-4 ${bg} space-y-2`}>
                <p className={`text-xs font-bold uppercase tracking-widest ${textColor}`}>{label}</p>
                <p className={`text-3xl font-extrabold ${textColor}`}>{count}</p>
                <div className="w-full bg-white/60 rounded-full h-1.5">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                </div>
                <p className={`text-xs font-semibold ${textColor} opacity-70`}>{pct}% of total events</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">Recent Bookings</h2>
            <span className="text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
              Last {recentBookings.length}
            </span>
          </div>
          {recentBookings.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No bookings yet.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentBookings.map((bk) => {
                const bId = bk._id;
                const user = bk.userId;
                const event = bk.eventId;
                return (
                  <div key={bId} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{event?.title || 'Unknown Event'}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.name || user?.email || 'Unknown user'} · {bk.quantity} ticket{bk.quantity !== 1 ? 's' : ''} · ₹{bk.totalAmount}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={bk.bookingStatus} />
                      <StatusBadge status={bk.paymentStatus} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">Recent Payments</h2>
            <span className="text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
              Last {recentPayments.length}
            </span>
          </div>
          {recentPayments.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No payments yet.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentPayments.map((pay) => {
                const pId = pay._id;
                const user = pay.userId;
                return (
                  <div key={pId} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {pay.paymentReference || `PAY-${String(pId).substring(0, 8).toUpperCase()}`}
                      </p>
                      <p className="text-xs text-slate-400 truncate capitalize">
                        {user?.name || user?.email || 'Unknown user'} · {pay.paymentMethod} · ₹{pay.amount}
                      </p>
                    </div>
                    <StatusBadge status={pay.paymentStatus} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/admin/stadiums"
          className="flex items-center gap-4 p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
        >
          <span className="text-2xl">🏟️</span>
          <div>
            <p className="font-extrabold text-base">Manage Stadiums</p>
            <p className="text-slate-400 text-xs mt-0.5">Add, edit, or deactivate venue records</p>
          </div>
          <span className="ml-auto text-slate-500 group-hover:text-white transition-colors text-lg">→</span>
        </Link>
        <Link
          to="/events"
          className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
        >
          <span className="text-2xl">⚽</span>
          <div>
            <p className="font-extrabold text-base">Browse Events</p>
            <p className="text-blue-100 text-xs mt-0.5">View all scheduled sports events</p>
          </div>
          <span className="ml-auto text-blue-300 group-hover:text-white transition-colors text-lg">→</span>
        </Link>
      </div>
    </div>
  );
}