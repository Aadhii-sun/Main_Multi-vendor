import React, { createContext, useContext, useEffect, useState } from 'react';

const WishlistContext = createContext(null);
export const useWishlist = () => useContext(WishlistContext);

const STORAGE_KEY = 'wishlist_items';

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const toggle = (product) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      return exists ? prev.filter((p) => p.id !== product.id) : [product, ...prev];
    });
  };

  const value = { items, toggle };
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};


