import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface WishlistContextType {
  wishlistIds: number[];
  isSaved: (id: number) => boolean;
  toggleWishlist: (id: number) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const { user } = useAuth();
  const { showToast } = useToast();

  const refreshWishlist = async () => {
    if (!user) {
      setWishlistIds([]);
      return;
    }
    try {
      const ids = await api.getWishlistIds();
      setWishlistIds(ids);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [user]);

  const isSaved = (id: number) => wishlistIds.includes(id);

  const toggleWishlist = async (id: number) => {
    if (!user) {
      showToast('Please sign in to save machines to your wishlist', 'info');
      return;
    }
    try {
      const res = await api.toggleWishlist(id);
      if (res.saved) {
        setWishlistIds((prev) => [...prev, id]);
        showToast('Machine saved to your wishlist', 'success');
      } else {
        setWishlistIds((prev) => prev.filter((item) => item !== id));
        showToast('Machine removed from your wishlist', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating wishlist', 'error');
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistIds, isSaved, toggleWishlist, refreshWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
