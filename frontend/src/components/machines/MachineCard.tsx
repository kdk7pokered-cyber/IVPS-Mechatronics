import React from 'react';
import {
  Heart, Scale, MapPin, Calendar, Clock, ArrowUpRight, ShieldCheck, Tag, Lock
} from 'lucide-react';
import { MachineCardData } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';

interface MachineCardProps {
  machine: MachineCardData;
  onSelect: (id: number) => void;
}

export const MachineCard: React.FC<MachineCardProps> = ({ machine, onSelect }) => {
  const { isSaved, toggleWishlist } = useWishlist();
  const { isCompared, addToCompare } = useCompare();

  const saved = isSaved(machine.id);
  const compared = isCompared(machine.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getConditionColor = (cond: string) => {
    switch (cond) {
      case 'Brand New':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Excellent':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'Very Good':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Good':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    }
  };

  return (
    <div className="group bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col">
      {/* Image Container */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-950">
        <img
          src={machine.primary_image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'}
          alt={machine.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {machine.listing_type === 'new' ? (
            <span className="px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-lg bg-emerald-500 text-slate-950 shadow-md">
              NEW
            </span>
          ) : (
            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border backdrop-blur-md ${getConditionColor(machine.condition)}`}>
              {machine.condition}
            </span>
          )}

          {machine.is_featured && (
            <span className="px-2 py-1 text-[10px] font-bold uppercase rounded-lg bg-amber-500 text-slate-950">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist & Compare Quick Actions */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCompare(machine);
            }}
            title={compared ? 'Remove from compare' : 'Add to compare'}
            className={`p-2 rounded-xl backdrop-blur-md border transition ${
              compared
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:text-white hover:border-slate-500'
            }`}
          >
            <Scale className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(machine.id);
            }}
            title={saved ? 'Remove from wishlist' : 'Save machine'}
            className={`p-2 rounded-xl backdrop-blur-md border transition ${
              saved
                ? 'bg-rose-500 text-white border-rose-400'
                : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:text-rose-400 hover:border-slate-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Category & Location Footer on Image */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300">
          <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700 backdrop-blur-sm text-amber-300 font-medium truncate max-w-[150px]">
            {machine.category}
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <MapPin className="w-3 h-3 text-amber-400" />
            {machine.city}, {machine.state}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Broker attribution badge */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <div className="flex items-center gap-1 truncate">
              <span>Broker:</span>
              <span className="text-slate-200 font-medium truncate">{machine.broker_name}</span>
              {machine.broker_verified && (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-amber-400/90 font-mono flex-shrink-0">
              <Lock className="w-3 h-3" />
              <span>Unlock ₹{machine.contact_unlock_fee || 99}</span>
            </div>
          </div>

          {/* Machine Title */}
          <h3
            onClick={() => onSelect(machine.id)}
            className="text-base font-bold text-white hover:text-amber-400 transition cursor-pointer line-clamp-2 leading-snug"
          >
            {machine.title}
          </h3>

          {/* Key Specs Row */}
          <div className="grid grid-cols-2 gap-2 mt-3 py-2.5 border-y border-slate-800/80 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400/80" />
              <span>Year: <strong className="text-slate-200">{machine.year}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400/80" />
              <span>
                {machine.listing_type === 'new' ? (
                  <strong className="text-emerald-400">0 Hours (New)</strong>
                ) : (
                  <>Hours: <strong className="text-slate-200">{machine.usage_hours.toLocaleString()}</strong></>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-4 pt-2 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <span>Asking Price</span>
              {machine.negotiable && (
                <span className="text-[10px] text-amber-400/90 font-medium">(Negotiable)</span>
              )}
            </div>
            <div className="text-lg font-black text-amber-400">
              {formatPrice(machine.price)}
            </div>
          </div>

          <button
            onClick={() => onSelect(machine.id)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-bold transition group/btn"
          >
            <span>View Details</span>
            <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
