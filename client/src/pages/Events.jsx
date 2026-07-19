import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useApiState from '../hooks/useApiState';
import usePagination from '../hooks/usePagination';
import { getAllEvents } from '../services/event.service';
import EventSearch from '../components/event/EventSearch';
import EventFilters from '../components/event/EventFilters';
import EventGrid from '../components/event/EventGrid';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Events() {
  const [searchParams] = useSearchParams();
  const api = useApiState(null);
  const { currentPage, setCurrentPage, totalPages, setTotalPages } = usePagination(1, 1);

  // Pre-seed filters from URL query params (e.g. ?sport=Cricket from Home page sport cards)
  const [filters, setFilters] = useState(() => ({
    q: searchParams.get('q') || '',
    sport: searchParams.get('sport') || '',
    city: searchParams.get('city') || '',
    startDateFrom: searchParams.get('startDateFrom') || '',
    startDateTo: searchParams.get('startDateTo') || '',
    page: 1,
    limit: 16,
  }));

  useEffect(() => {
    let mounted = true;
    async function fetch() {
      api.setLoading(true);
      try {
        const params = { ...filters, sportsOnly: true, page: currentPage, limit: filters.limit };
        const res = await getAllEvents(params);
        if (!mounted) return;
        api.setData(res.data);
        api.setError(null);
        const meta = res.data && res.data.meta;
        const tp = meta ? Math.ceil((meta.total || 0) / (meta.limit || params.limit || 12)) : 1;
        setTotalPages(tp);
      } catch (err) {
        if (!mounted) return;
        api.setError(err);
      } finally {
        if (!mounted) return;
        api.setLoading(false);
      }
    }
    fetch();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters.q, filters.city, filters.sport, filters.startDateFrom, filters.startDateTo]);

  const onSearch = (q) => {
    setFilters((f) => ({ ...f, q, page: 1 }));
    setCurrentPage(1);
  };

  const onFilters = (newFilters) => {
    setFilters((f) => ({ ...f, ...newFilters, page: 1 }));
    setCurrentPage(1);
  };

  const onPageChange = (page) => setCurrentPage(page);

  const payload = api.data && api.data.data ? api.data.data : [];
  const isEmpty = !api.loading && (!payload || payload.length === 0);

  const activeSportLabel = filters.sport ? ` – ${filters.sport}` : '';

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sports Events{activeSportLabel}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Browse, filter and book passes for upcoming matches.</p>
        </div>
      </div>

      <div>
        <EventSearch value={filters.q} onChange={onSearch} />
      </div>

      <div>
        <EventFilters filters={filters} onChange={onFilters} />
      </div>

      {api.loading && <div className="flex justify-center py-12"><LoadingSpinner /></div>}

      {api.error && (
        <div className="p-4 text-center text-red-600 bg-red-50 rounded-2xl border border-red-200">
          Error loading events. <button onClick={() => setFilters({ ...filters })} className="underline font-bold">Retry</button>
        </div>
      )}

      {isEmpty && <EmptyState title="No events found" description={filters.sport ? `No ${filters.sport} events currently scheduled. Try another sport or clear the filter.` : 'No events found matching your criteria.'} actionText="Clear Filters" onAction={() => { setFilters({ q: '', sport: '', city: '', startDateFrom: '', startDateTo: '', page: 1, limit: 12 }); setCurrentPage(1); }} />}

      {!api.loading && payload && payload.length > 0 && <EventGrid items={payload} />}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
}
