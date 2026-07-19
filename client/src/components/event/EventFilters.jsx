import React from 'react';

const SPORTS = [
  { id: '', label: '⚽ All' },
  { id: 'Football', label: '⚽ Soccer' },
  { id: 'Cricket', label: '🏏 Cricket' },
  { id: 'Basketball', label: '🏀 Basketball' },
  { id: 'Tennis', label: '🎾 Tennis' },
  { id: 'Hockey', label: '🏑 Hockey' },
  { id: 'Badminton', label: '🏸 Badminton' }
];

export default function EventFilters({ filters = {}, onChange }) {
  const update = (k, v) => onChange && onChange({ ...filters, [k]: v });

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
      {/* Sport Category Pills */}
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Filter by Sport</label>
        <div className="flex flex-wrap gap-2">
          {SPORTS.map((sport) => {
            const isSelected = (filters.sport || '') === sport.id;
            return (
              <button
                key={sport.id}
                type="button"
                onClick={() => update('sport', sport.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-150 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {sport.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date and Location Filter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* City Input */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">City Location</label>
          <input
            placeholder="e.g. Mumbai, New York"
            value={filters.city || ''}
            onChange={(e) => update('city', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-808 outline-none focus:border-blue-500 bg-slate-50/50 focus:bg-white"
          />
        </div>

        {/* Start Date From */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">From Date</label>
          <input
            type="date"
            value={filters.startDateFrom || ''}
            onChange={(e) => update('startDateFrom', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-808 outline-none focus:border-blue-500 bg-slate-50/50 focus:bg-white"
          />
        </div>

        {/* Start Date To */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">To Date</label>
          <input
            type="date"
            value={filters.startDateTo || ''}
            onChange={(e) => update('startDateTo', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-808 outline-none focus:border-blue-500 bg-slate-50/50 focus:bg-white"
          />
        </div>
      </div>
    </div>
  );
}