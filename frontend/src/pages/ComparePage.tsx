import React from 'react';
import { Scale, Trash2, ArrowRight, ExternalLink, Plus } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { MachineCardData } from '../types';

interface ComparePageProps {
  onNavigate: (view: string, id?: number) => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({ onNavigate }) => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  if (compareList.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 text-amber-400 mx-auto flex items-center justify-center">
          <Scale className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Your Comparison Matrix is Empty</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Add up to 4 heavy machines from our New or Second-Hand marketplaces to inspect technical parameters, condition ratings, and prices side-by-side.
        </p>
        <div className="pt-2">
          <button
            onClick={() => onNavigate('new-machines')}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition"
          >
            Explore Machinery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
            <Scale className="w-4 h-4" />
            Machine Comparison Matrix
          </div>
          <h1 className="text-3xl font-black text-white">
            Compare Selected Equipment ({compareList.length}/4)
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {compareList.length < 4 && (
            <button
              onClick={() => onNavigate('new-machines')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 transition"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              Add More Machines
            </button>
          )}
          <button
            onClick={clearCompare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-950 border border-rose-500/30 text-xs font-semibold text-rose-300 transition"
          >
            <Trash2 className="w-4 h-4" />
            Clear Comparison
          </button>
        </div>
      </div>

      {/* Side by Side Matrix Table */}
      <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr>
              <th className="p-4 w-48 text-slate-400 font-bold uppercase tracking-wider bg-slate-950/50 rounded-tl-2xl">
                Parameter
              </th>
              {compareList.map((m) => (
                <th key={m.id} className="p-4 min-w-[240px] align-top bg-slate-950/30">
                  <div className="space-y-3">
                    <div className="relative h-36 rounded-xl overflow-hidden bg-slate-950">
                      <img
                        src={m.primary_image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'}
                        alt={m.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeFromCompare(m.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/80 text-rose-400 hover:text-white"
                        title="Remove from comparison"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <div className="text-[11px] text-amber-400 font-bold uppercase">{m.category}</div>
                      <h3 className="font-bold text-white text-sm line-clamp-1">{m.title}</h3>
                    </div>

                    <button
                      onClick={() => onNavigate('machine-detail', m.id)}
                      className="w-full py-2 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {/* Price Row */}
            <tr>
              <th className="p-4 font-bold text-slate-400 bg-slate-950/40">Asking Price</th>
              {compareList.map((m) => (
                <td key={m.id} className="p-4 font-black text-amber-400 text-sm">
                  ₹{m.price.toLocaleString('en-IN')}
                  {m.negotiable && <span className="block text-[10px] text-slate-400 font-normal">Negotiable</span>}
                </td>
              ))}
            </tr>

            {/* Segment */}
            <tr>
              <th className="p-4 font-bold text-slate-400 bg-slate-950/40">Market Segment</th>
              {compareList.map((m) => (
                <td key={m.id} className="p-4 font-semibold text-white capitalize">
                  {m.listing_type === 'new' ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">New Machine</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">Second-Hand</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Manufacturer */}
            <tr>
              <th className="p-4 font-bold text-slate-400 bg-slate-950/40">Manufacturer</th>
              {compareList.map((m) => (
                <td key={m.id} className="p-4 font-medium text-white">
                  {m.manufacturer}
                </td>
              ))}
            </tr>

            {/* Model */}
            <tr>
              <th className="p-4 font-bold text-slate-400 bg-slate-950/40">Model</th>
              {compareList.map((m) => (
                <td key={m.id} className="p-4 font-medium text-white">
                  {m.model}
                </td>
              ))}
            </tr>

            {/* Year */}
            <tr>
              <th className="p-4 font-bold text-slate-400 bg-slate-950/40">Manufacturing Year</th>
              {compareList.map((m) => (
                <td key={m.id} className="p-4 font-medium text-white">
                  {m.year}
                </td>
              ))}
            </tr>

            {/* Condition Grade */}
            <tr>
              <th className="p-4 font-bold text-slate-400 bg-slate-950/40">Condition Rating</th>
              {compareList.map((m) => (
                <td key={m.id} className="p-4 font-medium text-white">
                  {m.condition}
                </td>
              ))}
            </tr>

            {/* Usage Hours */}
            <tr>
              <th className="p-4 font-bold text-slate-400 bg-slate-950/40">Operating Usage</th>
              {compareList.map((m) => (
                <td key={m.id} className="p-4 font-medium text-white">
                  {m.listing_type === 'new' ? (
                    <span className="text-emerald-400 font-semibold">0 Hours (Brand New)</span>
                  ) : (
                    <span>{m.usage_hours.toLocaleString()} Hours</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Location */}
            <tr>
              <th className="p-4 font-bold text-slate-400 bg-slate-950/40">Location</th>
              {compareList.map((m) => (
                <td key={m.id} className="p-4 font-medium text-white">
                  {m.city}, {m.state}
                </td>
              ))}
            </tr>

            {/* Broker Info */}
            <tr>
              <th className="p-4 font-bold text-slate-400 bg-slate-950/40">Certified Broker</th>
              {compareList.map((m) => (
                <td key={m.id} className="p-4 font-medium text-white">
                  {m.broker_name} {m.broker_company ? `(${m.broker_company})` : ''}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
