import React from 'react';
import { Filter, RotateCcw, Search } from 'lucide-react';
import { FilterParams } from '../../types';

interface MachineFiltersProps {
  filters: FilterParams;
  categories: string[];
  onChange: (newFilters: FilterParams) => void;
  onClear: () => void;
  className?: string;
}

const CONDITIONS = ['Brand New', 'Excellent', 'Very Good', 'Good', 'Fair', 'Needs Maintenance'];

export const MachineFilters: React.FC<MachineFiltersProps> = ({
  filters,
  categories,
  onChange,
  onClear,
  className = ''
}) => {
  const handleChange = (key: keyof FilterParams, value: any) => {
    onChange({
      ...filters,
      [key]: value === '' ? undefined : value,
      page: 1 // Reset page on filter change
    });
  };

  const hasActiveFilters = Boolean(
    filters.q ||
    filters.listing_type ||
    filters.category ||
    filters.manufacturer ||
    filters.condition ||
    filters.min_price ||
    filters.max_price ||
    filters.min_year ||
    filters.max_year ||
    filters.max_hours ||
    filters.location
  );

  return (
    <div className={`bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white text-base">Refine Machinery</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear All
          </button>
        )}
      </div>

      {/* Search Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Keyword Search
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search model, specs, brand..."
            value={filters.q || ''}
            onChange={(e) => handleChange('q', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 pl-9 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        </div>
      </div>

      {/* Listing Type Toggle (All, New, Second-Hand) */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Marketplace Segment
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => handleChange('listing_type', undefined)}
            className={`py-1.5 rounded-lg font-semibold transition ${
              !filters.listing_type
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleChange('listing_type', 'new')}
            className={`py-1.5 rounded-lg font-semibold transition ${
              filters.listing_type === 'new'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            New
          </button>
          <button
            onClick={() => handleChange('listing_type', 'second_hand')}
            className={`py-1.5 rounded-lg font-semibold transition ${
              filters.listing_type === 'second_hand'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Used
          </button>
        </div>
      </div>

      {/* Category Dropdown */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Machine Category
        </label>
        <select
          value={filters.category || ''}
          onChange={(e) => handleChange('category', e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none transition"
        >
          <option value="">All Categories ({categories.length})</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Condition (Pills) */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Condition Grade
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CONDITIONS.map((cond) => {
            const isSelected = filters.condition === cond;
            return (
              <button
                key={cond}
                onClick={() => handleChange('condition', isSelected ? undefined : cond)}
                className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {cond}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range in INR (₹) */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Price Range (₹ INR)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={filters.min_price || ''}
            onChange={(e) => handleChange('min_price', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Max ₹"
            value={filters.max_price || ''}
            onChange={(e) => handleChange('max_price', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Manufacturing Year Range */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Manufacturing Year
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="From (e.g. 2018)"
            value={filters.min_year || ''}
            onChange={(e) => handleChange('min_year', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <input
            type="number"
            placeholder="To (e.g. 2024)"
            value={filters.max_year || ''}
            onChange={(e) => handleChange('max_year', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Max Usage Hours for Used Equipment */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Max Usage Hours
        </label>
        <input
          type="number"
          placeholder="e.g. 5000 hrs"
          value={filters.max_hours || ''}
          onChange={(e) => handleChange('max_hours', e.target.value ? Number(e.target.value) : undefined)}
          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Location / State
        </label>
        <input
          type="text"
          placeholder="e.g. Pune, Gujarat, Bengaluru"
          value={filters.location || ''}
          onChange={(e) => handleChange('location', e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
        />
      </div>
    </div>
  );
};
