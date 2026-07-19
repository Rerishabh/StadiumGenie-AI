import React, { useEffect, useState } from 'react';
import useApiState from '../hooks/useApiState';
import usePagination from '../hooks/usePagination';
import { getAllStadiums } from '../services/stadium.service';
import StadiumSearch from '../components/stadium/StadiumSearch';
import StadiumFilters from '../components/stadium/StadiumFilters';
import StadiumGrid from '../components/stadium/StadiumGrid';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Stadiums() {
  const api = useApiState(null);
  const { currentPage, setCurrentPage, totalPages, setTotalPages } = usePagination(1, 1);
  const [filters, setFilters] = useState({ q: '' , page: 1, limit: 16 });

  useEffect(() => {
    let mounted = true;
    async function fetch() {
      api.setLoading(true);
      try {
        const params = { ...filters, page: currentPage, limit: filters.limit };
        const res = await getAllStadiums(params);
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
  }, [currentPage, filters.q, filters.city, filters.country, filters.sport, filters.minCapacity]);

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

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Arenas & Stadiums
          </h1>
          <p className="text-sm text-slate-500 mt-1">Explore stadiums outfitted with accessibility routes, concessions, and navigation maps.</p>
        </div>
      </div>

      <div>
        <StadiumSearch value={filters.q} onChange={onSearch} />
      </div>

      <div>
        <StadiumFilters filters={filters} onChange={onFilters} />
      </div>

      {api.loading && <div className="flex justify-center"><LoadingSpinner /></div>}

      {api.error && (
        <div className="p-4 text-center text-red-600">
          Error loading stadiums. <button onClick={() => setFilters({ ...filters })} className="underline">Retry</button>
        </div>
      )}

      {isEmpty && <EmptyState title="No stadiums" description="No stadiums found." actionText="Retry" onAction={() => setFilters({ ...filters })} />}

      {!api.loading && payload && payload.length > 0 && <StadiumGrid items={payload} />}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
}