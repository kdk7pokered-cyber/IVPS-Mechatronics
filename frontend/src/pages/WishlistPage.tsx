import React, { useState, useEffect } from 'react';
import { Heart, Trash2, Scale, ArrowRight, ArrowUpRight } from 'lucide-react';
import { api } from '../services/api';
import { MachineCardData } from '../types';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useAuth } from '../context/AuthContext';

interface WishlistPageProps {
  onNavigate: (view: string, id?: number) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onNavigate }) => {
  const [machines, setMachines] = useState<MachineCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toggleWishlist } = useWishlist();
  const { addToCompare, isCompared } = useCompare();
  const { user } = useAuth();

  const fetchWishlist = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await api.getWishlist();
      setMachines(data);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const handleRemove = async (id: number) => {
    await toggleWishlist(id);
    setMachines((prev) => prev.filter((m) => m.id !== id));
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 text-rose-400 mx-auto flex items-center justify-center">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Sign In to View Saved Machinery</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
          Save favorite listings, monitor price adjustments, and compare machines across sessions.
        </p>
        <button
          onClick={() => onNavigate('login')}
          className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400 mb-1">
          <Heart className="w-4 h-4 fill-current" />
          Buyer Wishlist
        </div>
        <h1 className="text-3xl font-black text-white">Saved Industrial Machines ({machines.length})</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : machines.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 p-8 space-y-4">
          <p className="text-slate-400 text-sm">No machines saved to your wishlist yet.</p>
          <button
            onClick={() => onNavigate('new-machines')}
            className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
          >
            Explore Marketplace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {machines.map((m) => (
            <div
              key={m.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 bg-slate-950">
                  <img
                    src={m.primary_image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'}
                    alt={m.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950/80 text-amber-300 border border-slate-700">
                      {m.category}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemove(m.id)}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-slate-950/80 text-rose-400 hover:text-white transition"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 space-y-3">
                  <div className="text-xs text-slate-400">{m.manufacturer} • {m.year}</div>
                  <h3
                    onClick={() => onNavigate('machine-detail', m.id)}
                    className="font-bold text-white text-base hover:text-amber-400 cursor-pointer line-clamp-1"
                  >
                    {m.title}
                  </h3>
                  <div className="text-lg font-black text-amber-400">
                    ₹{m.price.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                <button
                  onClick={() => addToCompare(m)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    isCompared(m.id)
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>{isCompared(m.id) ? 'In Compare' : 'Compare'}</span>
                </button>
                <button
                  onClick={() => onNavigate('machine-detail', m.id)}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1 transition"
                >
                  <span>Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
