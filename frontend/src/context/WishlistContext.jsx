import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('nutrikart_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nutrikart_wishlist', JSON.stringify(wishlist));
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (e) {
      console.error('Failed to save wishlist:', e);
    }
  }, [wishlist]);

  const isWishlisted = (productId) => {
    if (!productId) return false;
    const id = typeof productId === 'object' ? productId._id : productId;
    return wishlist.some((item) => (item._id || item.id) === id);
  };

  const toggleWishlist = (product) => {
    if (!product) return false;
    const id = product._id || product.id;
    let isAdded = false;

    setWishlist((prev) => {
      const exists = prev.some((item) => (item._id || item.id) === id);
      if (exists) {
        isAdded = false;
        return prev.filter((item) => (item._id || item.id) !== id);
      } else {
        isAdded = true;
        return [...prev, product];
      }
    });

    return isAdded;
  };

  const removeFromWishlist = (productId) => {
    const id = typeof productId === 'object' ? productId._id : productId;
    setWishlist((prev) => prev.filter((item) => (item._id || item.id) !== id));
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
