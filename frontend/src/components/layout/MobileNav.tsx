import React from 'react';
import { Home, Sparkles, PlusCircle, Heart, LayoutDashboard } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';

interface MobileNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate }) => {
  const { wishlistIds } = useWishlist();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 text-slate-400 flex items-center justify-around py-2 px-1">
      <button
        onClick={() => onNavigate('landing')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition ${
          currentView === 'landing' ? 'text-amber-400' : 'hover:text-slate-200'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-medium">Home</span>
      </button>

      <button
        onClick={() => onNavigate('new-machines')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition ${
          currentView === 'new-machines' ? 'text-amber-400' : 'hover:text-slate-200'
        }`}
      >
        <Sparkles className="w-5 h-5" />
        <span className="text-[10px] font-medium">New</span>
      </button>

      <button
        onClick={() => onNavigate('sell')}
        className="flex flex-col items-center -mt-5 bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 p-3 rounded-full shadow-lg shadow-amber-500/30 active:scale-90 transition"
      >
        <PlusCircle className="w-6 h-6" />
        <span className="text-[9px] font-bold text-slate-950 mt-0.5">Sell</span>
      </button>

      <button
        onClick={() => onNavigate('wishlist')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition relative ${
          currentView === 'wishlist' ? 'text-amber-400' : 'hover:text-slate-200'
        }`}
      >
        <Heart className="w-5 h-5" />
        <span className="text-[10px] font-medium">Saved</span>
        {wishlistIds.length > 0 && (
          <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
            {wishlistIds.length}
          </span>
        )}
      </button>

      <button
        onClick={() => onNavigate('dashboard')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition ${
          currentView === 'dashboard' ? 'text-amber-400' : 'hover:text-slate-200'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[10px] font-medium">Dashboard</span>
      </button>
    </div>
  );
};
