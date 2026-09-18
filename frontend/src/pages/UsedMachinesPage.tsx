import React, { useState, useEffect } from 'react';
import { Wrench, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { MachineCardData, FilterParams } from '../types';
import { MachineCard } from '../components/machines/MachineCard';
import { MachineFilters } from '../components/machines/MachineFilters';

interface UsedMachinesPageProps {
  initialFilters?: FilterParams;
  onNavigate: (view: string, id?: number) => void;
}

export const UsedMachinesPage: React.FC<UsedMachinesPageProps> = ({ initialFilters, onNavigate }) => {
  const [machines, setMachines] = useState<MachineCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterParams>({
    listing_type: 'second_hand',
    sort_by: 'newest',
    page: 1,
    page_size: 9,
    ...initialFilters
  });
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    api.getCategoriesSummary().then((cats) => {
      setCategories(cats.map((c) => c.name));
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchMachines = async () => {
      setIsLoading(true);
      try {
        const res = await api.listMachines(filters);
        setMachines(res.items);
        setTotal(res.total);
        setTotalPages(res.total_pages);
      } catch (err) {
        console.error('Error fetching used machines:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMachines();
  }, [filters]);

  const handleSortChange = (sortBy: string) => {
    setFilters((prev) => ({ ...prev, sort_by: sortBy, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 p-8 overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase">
            <Wrench className="w-3.5 h-3.5" />
            Inspected & Verified Second-Hand Inventory
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Second-Hand Industrial Machines
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Certified pre-owned machinery with documented operating hours, condition ratings, and verified broker representations.
          </p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="hidden lg:block lg:col-span-1">
          <MachineFilters
            filters={filters}
            categories={categories}
            onChange={setFilters}
            onClear={() => setFilters({ listing_type: 'second_hand', page: 1, page_size: 9, sort_by: 'newest' })}
          />
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <div className="text-xs text-slate-400 font-medium">
              Showing <strong className="text-white">{machines.length}</strong> of{' '}
              <strong className="text-amber-400">{total}</strong> pre-owned machines
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold"
              >
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                Filters
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
                <select
                  value={filters.sort_by || 'newest'}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="newest">Recently Listed</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="year_desc">Year: Newest First</option>
                  <option value="views">Most Viewed</option>
                </select>
              </div>
            </div>
          </div>

          {mobileFiltersOpen && (
            <div className="lg:hidden mb-6">
              <MachineFilters
                filters={filters}
                categories={categories}
                onChange={(f) => {
                  setFilters(f);
                  setMobileFiltersOpen(false);
                }}
                onClear={() => {
                  setFilters({ listing_type: 'second_hand', page: 1, page_size: 9, sort_by: 'newest' });
                  setMobileFiltersOpen(false);
                }}
              />
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="h-80 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : machines.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 p-8">
              <h3 className="text-lg font-bold text-white">No Second-Hand Machines Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try loosening your condition or year filters to see more available industrial equipment.
              </p>
              <button
                onClick={() => setFilters({ listing_type: 'second_hand', page: 1, page_size: 9, sort_by: 'newest' })}
                className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {machines.map((m) => (
                <MachineCard key={m.id} machine={m} onSelect={(id) => onNavigate('machine-detail', id)} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={filters.page === 1}
                onClick={() => handlePageChange((filters.page || 1) - 1)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs text-slate-400 px-4">
                Page <strong className="text-white">{filters.page}</strong> of <strong className="text-white">{totalPages}</strong>
              </span>
              <button
                disabled={filters.page === totalPages}
                onClick={() => handlePageChange((filters.page || 1) + 1)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
