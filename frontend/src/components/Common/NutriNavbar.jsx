import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, ChevronDown, Shield, Heart, Package, LogOut, Award, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { cartAPI } from '../../services/api';

const NutriNavbar = ({ searchTerm = '', setSearchTerm = () => {}, onSearch = () => {} }) => {
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const updateCartBadge = () => {
      if (user) {
        cartAPI.getCart()
          .then((res) => {
            const items = res.data?.cart?.items || [];
            const totalCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
            setCartCount(totalCount);
          })
          .catch(() => {});
      } else {
        setCartCount(0);
      }
    };

    updateCartBadge();
    window.addEventListener('cartUpdated', updateCartBadge);
    return () => window.removeEventListener('cartUpdated', updateCartBadge);
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(searchTerm);
      if (location.pathname !== '/products') {
        navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full shadow-md font-sans">
      {/* Primary Brand Blue Bar */}
      <div className="bg-[#2874f0] text-white px-4 md:px-12 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
          
          {/* NutriKart Logo */}
          <div 
            onClick={() => navigate('/dashboard')} 
            className="flex flex-col cursor-pointer select-none group flex-shrink-0"
          >
            <div className="flex items-center gap-1">
              <span className="text-xl md:text-2xl font-black italic tracking-tight text-white group-hover:scale-105 transition-transform">
                Nutri<span className="text-[#ffe500]">Kart</span>
              </span>
            </div>
            <div className="flex items-center gap-1 -mt-1 text-[11px] font-semibold italic text-[#f0f0f0] group-hover:text-white">
              <span>Explore</span>
              <span className="text-[#ffe500] font-bold flex items-center gap-0.5">
                Plus <span className="text-[13px] text-[#ffe500]">✦</span>
              </span>
            </div>
          </div>

          {/* Neomorphic Search Input */}
          <div className="flex-1 max-w-2xl relative">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search for health products, whey protein, vitamins, brands and more..."
                className="w-full bg-[#f1f3f6] text-[#212121] placeholder-gray-500 text-sm py-2.5 pl-4 pr-11 rounded-sm shadow-[inset_2px_2px_4px_#c2cad8,inset_-2px_-2px_4px_#ffffff] focus:outline-none focus:ring-2 focus:ring-[#ffe500]/60 transition-all font-medium"
              />
              <button
                onClick={() => {
                  onSearch(searchTerm);
                  if (location.pathname !== '/products') {
                    navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
                  }
                }}
                className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center text-[#2874f0] hover:text-[#1a5ecc] transition-colors"
                title="Search"
              >
                <Search size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Action Navigation Items */}
          <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
            
            {/* User Account / Login Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setProfileDropdown(!profileDropdown)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#2874f0] font-bold text-sm rounded-sm hover:shadow-md transition-all active:scale-95 shadow-[2px_2px_6px_rgba(0,0,0,0.2)]"
                  >
                    <User size={15} />
                    <span className="max-w-[100px] truncate">{user.name?.split(' ')[0] || 'Account'}</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${profileDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Account Dropdown */}
                  {profileDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-[#f1f3f6] text-[#212121] rounded-xl shadow-[8px_8px_20px_#c2cad8,-8px_-8px_20px_#ffffff] border border-white/80 py-2 z-50 animate-in fade-in duration-150">
                      <div className="px-4 py-3 border-b border-gray-200/80 bg-gradient-to-r from-blue-50/50 to-transparent">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Welcome Back</p>
                        <p className="font-bold text-[#2874f0] text-sm truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => { setProfileDropdown(false); navigate('/dashboard'); }}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-white hover:text-[#2874f0] flex items-center gap-3 transition-colors"
                        >
                          <Award size={16} className="text-[#ffe500] fill-[#ffe500]" />
                          <span>NutriKart Plus Zone</span>
                        </button>

                        <button
                          onClick={() => { setProfileDropdown(false); navigate('/orders'); }}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-white hover:text-[#2874f0] flex items-center gap-3 transition-colors"
                        >
                          <Package size={16} className="text-blue-600" />
                          <span>My Orders</span>
                        </button>

                        <button
                          onClick={() => { setProfileDropdown(false); navigate('/wishlist'); }}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-white hover:text-[#2874f0] flex items-center gap-3 transition-colors"
                        >
                          <Heart size={16} className="text-red-500 fill-red-500" />
                          <span>My Wishlist ({wishlistCount})</span>
                        </button>

                        <button
                          onClick={() => { setProfileDropdown(false); navigate('/products'); }}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-white hover:text-[#2874f0] flex items-center gap-3 transition-colors"
                        >
                          <ShoppingBag size={16} className="text-indigo-600" />
                          <span>All Health Products</span>
                        </button>

                        <button
                          onClick={() => { setProfileDropdown(false); navigate('/cart'); }}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-white hover:text-[#2874f0] flex items-center gap-3 transition-colors"
                        >
                          <ShoppingCart size={16} className="text-orange-500" />
                          <span>My Cart ({cartCount})</span>
                        </button>

                        <button
                          onClick={() => { setProfileDropdown(false); navigate('/admin/dashboard'); }}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-white hover:text-[#2874f0] flex items-center gap-3 transition-colors"
                        >
                          <Shield size={16} className="text-emerald-600" />
                          <span>Behavioral SOC Monitor</span>
                        </button>
                      </div>

                      <div className="border-t border-gray-200/80 pt-1 mt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                        >
                          <LogOut size={16} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 1-Click Visible Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-sm bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-all shadow-sm active:scale-95 border border-white/20"
                  title="Logout / Switch Account"
                >
                  <LogOut size={13} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-1.5 bg-white text-[#2874f0] font-bold text-sm rounded-sm hover:shadow-md transition-all active:scale-95 shadow-[2px_2px_6px_rgba(0,0,0,0.2)]"
              >
                Login
              </button>
            )}

            {/* Orders Header Link */}
            <button
              onClick={() => navigate('/orders')}
              className="hidden md:flex items-center gap-1.5 text-white font-bold text-sm hover:opacity-90 transition-opacity"
              title="View your orders and track packages"
            >
              <Package size={18} />
              <span>Orders</span>
            </button>

            {/* Wishlist (Likes) Button with Live Red/Pink Badge */}
            <button
              onClick={() => navigate('/wishlist')}
              className="flex items-center gap-1.5 text-white font-bold text-sm hover:opacity-90 transition-opacity relative group"
              title="My Wishlist"
            >
              <div className="relative">
                <Heart size={19} className={wishlistCount > 0 ? "fill-red-400 text-red-400" : ""} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Wishlist</span>
            </button>

            {/* Cart Button with Yellow Badge */}
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center gap-2 text-white font-bold text-sm hover:opacity-90 transition-opacity relative group"
            >
              <div className="relative">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-[#ffe500] text-[#2874f0] text-[11px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Cart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Subheader Bar */}
      <div className="bg-[#f1f3f6] border-b border-gray-200/80 px-4 md:px-12 py-2 overflow-x-auto scrollbar-hide shadow-[0_4px_10px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 md:gap-6 min-w-max">
          
          <button
            onClick={() => navigate('/products')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              location.pathname === '/products' && !location.search
                ? 'bg-[#2874f0] text-white shadow-[2px_2px_6px_rgba(40,116,240,0.3)]'
                : 'bg-[#f1f3f6] text-[#212121] hover:text-[#2874f0] shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff]'
            }`}
          >
            <span>🏷️</span>
            <span>All Health Products</span>
          </button>

          <button
            onClick={() => navigate('/products?category=Protein')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-[#f1f3f6] text-[#212121] hover:text-[#2874f0] shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] transition-all"
          >
            <span>🥛</span>
            <span>Whey & Protein</span>
          </button>

          <button
            onClick={() => navigate('/products?category=Equipment')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-[#f1f3f6] text-[#212121] hover:text-[#2874f0] shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] transition-all"
          >
            <span>🏋️</span>
            <span>Fitness Equipment</span>
          </button>

          <button
            onClick={() => navigate('/products?category=Snacks')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-[#f1f3f6] text-[#212121] hover:text-[#2874f0] shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] transition-all"
          >
            <span>🍪</span>
            <span>Healthy Snacks</span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              location.pathname === '/dashboard'
                ? 'bg-[#2874f0] text-white shadow-[2px_2px_6px_rgba(40,116,240,0.3)]'
                : 'bg-[#f1f3f6] text-[#212121] hover:text-[#2874f0] shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff]'
            }`}
          >
            <span>⚖️</span>
            <span>BMI & Health Station</span>
          </button>

          <button
            onClick={() => navigate('/cart')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              location.pathname === '/cart'
                ? 'bg-[#fb641b] text-white shadow-[2px_2px_6px_rgba(251,100,27,0.3)]'
                : 'bg-[#f1f3f6] text-[#212121] hover:text-[#fb641b] shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff]'
            }`}
          >
            <span>⚡</span>
            <span>Deals & Cart ({cartCount})</span>
          </button>

          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-[#f1f3f6] text-emerald-700 hover:text-emerald-800 shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] transition-all"
          >
            <span>🛡️</span>
            <span>SOC Telemetry</span>
          </button>

        </div>
      </div>
    </header>
  );
};

export default NutriNavbar;

