import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, ShoppingCart, Trash2, ArrowRight, Star, 
  Sparkles, AlertCircle, CheckCircle2, ShoppingBag, ShieldCheck, Zap
} from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { cartAPI } from '../../services/api';
import NutriNavbar from '../Common/NutriNavbar';
import NutriFooter from '../Common/NutriFooter';
import { resolveProductImage, getCategoryFallback } from '../../utils/imageHelper';

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist, clearWishlist, wishlistCount } = useWishlist();
  const { user } = useAuth();
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleMoveToCart = async (product) => {
    if (!user) {
      showToast('Please login to add items to your cart', 'error');
      setTimeout(() => navigate('/login'), 1200);
      return;
    }

    try {
      const activeVariant = product.variants?.[0];
      const price = activeVariant?.price || product.price;
      const variantSize = activeVariant?.size || '';

      await cartAPI.addToCart({
        productId: product._id || product.id,
        quantity: 1,
        selectedVariant: variantSize,
        price
      });

      removeFromWishlist(product._id || product.id);
      window.dispatchEvent(new Event('cartUpdated'));
      showToast(`Moved "${product.name}" to your cart!`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to move product to cart', 'error');
    }
  };

  const handleBuyNow = async (product) => {
    if (!user) {
      showToast('Please login to proceed with instant checkout', 'error');
      setTimeout(() => navigate('/login'), 1200);
      return;
    }

    try {
      const activeVariant = product.variants?.[0];
      const price = activeVariant?.price || product.price;
      const variantSize = activeVariant?.size || '';

      await cartAPI.addToCart({
        productId: product._id || product.id,
        quantity: 1,
        selectedVariant: variantSize,
        price
      });

      window.dispatchEvent(new Event('cartUpdated'));
      navigate('/cart?checkout=true');
    } catch (err) {
      window.dispatchEvent(new Event('cartUpdated'));
      navigate('/cart?checkout=true');
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-[#212121] font-sans flex flex-col selection:bg-[#2874f0] selection:text-white">
      {/* NutriNavbar */}
      <NutriNavbar />

      {/* Main Body */}
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 flex-1">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-4">
          <span className="hover:text-[#2874f0] cursor-pointer" onClick={() => navigate('/products')}>Home</span>
          <span>&gt;</span>
          <span className="hover:text-[#2874f0] cursor-pointer" onClick={() => navigate('/dashboard')}>My Account</span>
          <span>&gt;</span>
          <span className="text-gray-900 font-bold">My Wishlist</span>
        </div>

        {/* Wishlist Header Card */}
        <div className="bg-[#f1f3f6] rounded-2xl p-5 md:p-6 shadow-[6px_6px_16px_#c5cad3,-6px_-6px_16px_#ffffff] border border-white mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shadow-inner">
              <Heart size={24} className="fill-red-500" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <span>My Wishlist</span>
                <span className="text-xs font-black bg-blue-100 text-[#2874f0] px-2.5 py-0.5 rounded-full">
                  {wishlistCount} {wishlistCount === 1 ? 'Item' : 'Items'}
                </span>
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Saved health products and fitness essentials for your next purchase.
              </p>
            </div>
          </div>

          {wishlistCount > 0 && (
            <button
              onClick={clearWishlist}
              className="text-xs font-bold text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              Clear Entire Wishlist
            </button>
          )}
        </div>

        {/* Empty State */}
        {wishlistCount === 0 ? (
          <div className="bg-[#f1f3f6] rounded-3xl p-10 md:p-16 text-center shadow-[6px_6px_16px_#c5cad3,-6px_-6px_16px_#ffffff] border border-white max-w-2xl mx-auto space-y-4 my-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-[#f1f3f6] shadow-[inset_4px_4px_8px_#c5cad3,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center text-red-400">
              <Heart size={44} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Empty Wishlist!</h2>
            <p className="text-xs md:text-sm text-gray-500 font-medium max-w-sm mx-auto">
              You haven't liked any products yet. Browse our 100+ fitness supplements and equipment and click the heart icon!
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/products')}
                className="neo-btn-blue px-8 py-3 text-xs md:text-sm font-black uppercase tracking-wider shadow-lg"
              >
                Explore Health Products
              </button>
            </div>
          </div>
        ) : (
          /* Wishlist Items Grid (Flipkart Style) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {wishlist.map((product) => {
              const prodId = product._id || product.id;
              const imgSrc = resolveProductImage(product.image || product, product.category);
              const fallbackSrc = getCategoryFallback(product.category || 'Supplements');
              const mrp = Math.round((product.price || 499) * 1.45);
              const discount = Math.round(((mrp - product.price) / mrp) * 100);

              return (
                <div
                  key={prodId}
                  className="bg-[#f1f3f6] rounded-2xl p-4 shadow-[6px_6px_16px_#c5cad3,-6px_-6px_16px_#ffffff] border border-white flex flex-col justify-between hover:shadow-[8px_8px_20px_#b8bfc9,-8px_-8px_20px_#ffffff] transition-all group relative"
                >
                  {/* Floating Remove Button */}
                  <button
                    onClick={() => {
                      removeFromWishlist(prodId);
                      showToast(`Removed "${product.name}" from wishlist`);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-gray-400 hover:text-red-500 shadow-md flex items-center justify-center transition-all z-10 active:scale-90"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={15} />
                  </button>

                  {/* Top: Image & Category Badge */}
                  <div>
                    <div className="relative w-full h-44 rounded-xl bg-white p-3 shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] flex items-center justify-center overflow-hidden border border-gray-100 mb-3">
                      <img
                        src={imgSrc}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.src = fallbackSrc; }}
                      />
                      <span className="absolute bottom-2 left-2 text-[10px] font-black uppercase tracking-wider bg-gray-900/80 text-white px-2 py-0.5 rounded">
                        {product.category || 'Nutrition'}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 
                      onClick={() => navigate('/products')}
                      className="text-xs sm:text-sm font-black text-gray-900 line-clamp-2 hover:text-[#2874f0] cursor-pointer mb-2 leading-snug"
                    >
                      {product.name}
                    </h3>

                    {/* Rating Pill */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-[#388e3c] text-white px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-0.5 shadow-sm">
                        <span>{product.rating || '4.5'}</span>
                        <Star size={10} className="fill-white" />
                      </div>
                      <span className="text-[11px] text-gray-500 font-bold">
                        ({product.numReviews || 120} ratings)
                      </span>
                    </div>

                    {/* Price and MRP */}
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-base font-black text-gray-900">
                        ₹{product.price?.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-gray-400 line-through font-semibold">
                        ₹{mrp.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-black text-[#388e3c]">
                        {discount}% off
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Action Buttons (Move to Cart & Buy Now) */}
                  <div className="space-y-2 pt-2 border-t border-gray-200/80">
                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="w-full neo-btn-yellow py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                    >
                      <ShoppingCart size={14} strokeWidth={2.5} />
                      <span>Move to Cart</span>
                    </button>

                    <button
                      onClick={() => handleBuyNow(product)}
                      className="w-full neo-btn-orange py-2 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <Zap size={14} strokeWidth={2.5} />
                      <span>Buy Now</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Floating Toast */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 bg-[#212121] text-white px-5 py-3 rounded-xl shadow-2xl z-[200] animate-in slide-in-from-bottom-5 fade-in duration-300 flex items-center gap-3 border border-gray-700">
          {toast.type === 'error' ? (
            <AlertCircle className="text-[#fb641b]" size={20} />
          ) : (
            <CheckCircle2 className="text-[#ffe500]" size={20} />
          )}
          <span className="font-bold text-xs sm:text-sm">{toast.message}</span>
        </div>
      )}

      {/* NutriFooter */}
      <NutriFooter />
    </div>
  );
};

export default Wishlist;
