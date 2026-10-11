import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { productAPI, cartAPI, ASSET_URL } from '../../services/api';
import { 
  ShoppingCart, Heart, Star, ShieldCheck, Zap, 
  X, Check, AlertCircle, Filter, ArrowUpDown, ChevronRight, ChevronLeft, Tag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import NutriNavbar from '../Common/NutriNavbar';
import NutriFooter from '../Common/NutriFooter';
import { resolveProductImage, getCategoryFallback } from '../../utils/imageHelper';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popularity'); // popularity, price_asc, price_desc, rating
  const [priceRange, setPriceRange] = useState('all'); // all, under_500, 500_1000, 1000_plus
  const [minRating, setMinRating] = useState(0);
  const [fAssuredOnly, setFAssuredOnly] = useState(false);
  const [selectedBMI, setSelectedBMI] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCardVariants, setSelectedCardVariants] = useState({});
  const [selectedModalVariant, setSelectedModalVariant] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const { isWishlisted, toggleWishlist: contextToggleWishlist } = useWishlist();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync URL query params (e.g. ?category=Protein or ?search=whey)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catParam = params.get('category');
    const searchParam = params.get('search');
    if (catParam) setSelectedCategory(catParam);
    if (searchParam) setSearchTerm(searchParam);
  }, [location.search]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, selectedCategory, searchTerm, sortBy, priceRange, minRating, fAssuredOnly, selectedBMI]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAllProducts({});
      setProducts(response.data?.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productAPI.getCategories();
      setCategories(response.data?.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    // Price range
    if (priceRange === 'under_500') {
      filtered = filtered.filter((p) => p.price < 500);
    } else if (priceRange === '500_1000') {
      filtered = filtered.filter((p) => p.price >= 500 && p.price <= 1000);
    } else if (priceRange === '1000_plus') {
      filtered = filtered.filter((p) => p.price > 1000);
    }

    // Min rating
    if (minRating > 0) {
      filtered = filtered.filter((p) => (p.rating || 4.2) >= minRating);
    }

    // BMI Target
    if (selectedBMI) {
      filtered = filtered.filter((p) => 
        p.recommendedFor?.some((bmi) => bmi.toLowerCase() === selectedBMI.toLowerCase())
      );
    }

    // Sorting
    if (sortBy === 'price_asc') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price_desc') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 4.2) - (a.rating || 4.2));
    } else {
      // Default popularity
      filtered.sort((a, b) => (b.stock || 0) - (a.stock || 0));
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setPriceRange('all');
    setMinRating(0);
    setFAssuredOnly(false);
    setSelectedBMI('');
    setSortBy('popularity');
    setCurrentPage(1);
    navigate('/products');
  };

  const handleToggleWishlist = (product, e) => {
    if (e) e.stopPropagation();
    const isNowAdded = contextToggleWishlist(product);
    setToast({
      show: true,
      message: isNowAdded ? `Added "${product.name}" to Wishlist!` : `Removed "${product.name}" from Wishlist`,
      type: 'success'
    });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const getProductActiveVariant = (product) => {
    if (!product) return null;
    if (selectedCardVariants[product._id]) {
      return selectedCardVariants[product._id];
    }
    if (product.variants && product.variants.length > 0) {
      return product.variants[0];
    }
    return null;
  };

  const handleSelectCardVariant = (productId, variant) => {
    setSelectedCardVariants(prev => ({
      ...prev,
      [productId]: variant
    }));
  };

  const handleOpenProductModal = (product) => {
    setSelectedProduct(product);
    const activeVar = getProductActiveVariant(product);
    setSelectedModalVariant(activeVar);
  };

  const handleAddToCart = async (product, variantOverride, e) => {
    if (e) e.stopPropagation();
    if (!user) {
      setToast({
        show: true,
        message: 'Please login to add items to your cart',
        type: 'error'
      });
      setTimeout(() => navigate('/login'), 1200);
      return;
    }
    const variant = variantOverride || getProductActiveVariant(product);
    const itemPrice = variant?.price || product.price;
    const variantLabel = variant?.size || '';

    try {
      await cartAPI.addToCart({
        productId: product._id,
        quantity: 1,
        selectedVariant: variantLabel,
        price: itemPrice
      });
      window.dispatchEvent(new Event('cartUpdated'));
      setToast({
        show: true,
        message: `Added ${product.name}${variantLabel ? ` (${variantLabel})` : ''} to cart!`,
        type: 'success'
      });
      setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    } catch (error) {
      setToast({
        show: true,
        message: error.response?.data?.message || 'Failed to add item to cart',
        type: 'error'
      });
      setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 3000);
    }
  };

  const handleBuyNow = async (product, variantOverride, e) => {
    if (e) e.stopPropagation();
    if (!user) {
      setToast({
        show: true,
        message: 'Please login to proceed with instant checkout',
        type: 'error'
      });
      setTimeout(() => navigate('/login'), 1200);
      return;
    }
    const variant = variantOverride || getProductActiveVariant(product);
    const itemPrice = variant?.price || product.price;
    const variantLabel = variant?.size || '';

    try {
      await cartAPI.addToCart({
        productId: product._id,
        quantity: 1,
        selectedVariant: variantLabel,
        price: itemPrice
      });
      window.dispatchEvent(new Event('cartUpdated'));
      navigate('/cart?checkout=true');
    } catch (error) {
      window.dispatchEvent(new Event('cartUpdated'));
      navigate('/cart?checkout=true');
    }
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-[#212121] font-sans flex flex-col selection:bg-[#2874f0] selection:text-white">
      {/* NutriKart Brand Navigation Header */}
      <NutriNavbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={() => applyFilters()}
      />

      {/* Main NutriKart Content Body */}
      <main className="max-w-7xl w-full mx-auto px-2 md:px-6 py-4 flex-1">
        
        {/* NutriKart Big Health Billion Days Promotional Banner */}
        <div className="mb-5 rounded-2xl bg-gradient-to-r from-[#2874f0] via-[#1a5ecc] to-[#0d47a1] text-white p-4 md:p-6 shadow-[6px_6px_14px_#d1d9e6,-6px_-6px_14px_#ffffff] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-[#ffe500] text-[#2874f0] px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
              <Zap size={12} className="fill-[#2874f0]" /> Big Health Billion Days
            </div>
            <h2 className="text-2xl md:text-3xl font-black italic tracking-tight">
              UP TO 70% OFF ON PREMIUM NUTRITION & GEAR
            </h2>
            <p className="text-blue-100 text-xs md:text-sm font-medium">
              Verified 100% authentic whey isolate, creatine, daily vitamins & fitness equipment.
            </p>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl text-center">
              <span className="block text-[10px] uppercase font-bold text-yellow-300">Bank Offer</span>
              <span className="text-sm font-black">10% Instant Off</span>
            </div>
            <button 
              onClick={() => { setSelectedCategory(''); setPriceRange('under_500'); }}
              className="bg-[#ffe500] hover:bg-[#ffdb00] text-[#111] font-black text-xs md:text-sm px-5 py-2.5 rounded-xl shadow-md transition-transform active:scale-95"
            >
              SHOP DEALS
            </button>
          </div>
          {/* Subtle background decoration */}
          <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none"></div>
        </div>

        {/* NutriKart Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3 px-1">
          <span onClick={() => navigate('/dashboard')} className="hover:text-[#2874f0] cursor-pointer">Home</span>
          <ChevronRight size={12} />
          <span onClick={() => navigate('/products')} className="hover:text-[#2874f0] cursor-pointer">Health & Nutrition</span>
          {selectedCategory && (
            <>
              <ChevronRight size={12} />
              <span className="text-gray-800 font-bold capitalize">{selectedCategory}</span>
            </>
          )}
        </div>

        {/* 2-Column NutriKart Layout: Filter Sidebar + Products Grid */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          
          {/* LEFT COLUMN: Neomorphic Filter Sidebar */}
          <aside className="w-full lg:w-64 bg-[#f1f3f6] rounded-2xl p-5 shadow-[6px_6px_14px_#d1d9e6,-6px_-6px_14px_#ffffff] border border-white/80 shrink-0">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="font-extrabold text-base flex items-center gap-2 text-gray-800">
                <Filter size={16} className="text-[#2874f0]" />
                Filters
              </h3>
              {(selectedCategory || priceRange !== 'all' || minRating > 0 || selectedBMI) && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-[#2874f0] hover:underline"
                >
                  CLEAR ALL
                </button>
              )}
            </div>

            {/* Categories Filter */}
            <div className="py-4 border-b border-gray-200 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">CATEGORIES</p>
              <label 
                onClick={() => setSelectedCategory('')}
                className={`flex items-center justify-between text-xs py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
                  !selectedCategory 
                    ? 'bg-blue-50 text-[#2874f0] font-bold shadow-[inset_1px_1px_3px_#c5cad3,inset_-1px_-1px_3px_#ffffff]' 
                    : 'text-gray-700 hover:text-[#2874f0]'
                }`}
              >
                <span>All Categories</span>
                <span className="text-gray-400 font-normal">({products.length})</span>
              </label>

              {categories.map((cat) => {
                const count = products.filter(p => p.category?.toLowerCase() === cat.toLowerCase()).length;
                const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <label
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center justify-between text-xs py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-[#2874f0] font-bold shadow-[inset_1px_1px_3px_#c5cad3,inset_-1px_-1px_3px_#ffffff]'
                        : 'text-gray-700 hover:text-[#2874f0]'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="text-gray-400 font-normal">({count})</span>
                  </label>
                );
              })}
            </div>

            {/* NutriKart Assured Filter Toggle */}
            <div className="py-4 border-b border-gray-200">
              <label className="flex items-center justify-between cursor-pointer select-none">
                <span className="fk-assured-badge">
                  <span>✦</span> Assured
                </span>
                <input
                  type="checkbox"
                  checked={fAssuredOnly}
                  onChange={(e) => setFAssuredOnly(e.target.checked)}
                  className="w-4 h-4 text-[#2874f0] rounded focus:ring-0 cursor-pointer"
                />
              </label>
            </div>

            {/* Price Filter Chips */}
            <div className="py-4 border-b border-gray-200 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">PRICE RANGE</p>
              {[
                { id: 'all', label: 'All Prices' },
                { id: 'under_500', label: 'Under ₹500' },
                { id: '500_1000', label: '₹500 - ₹1,000' },
                { id: '1000_plus', label: '₹1,000 and Above' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPriceRange(p.id)}
                  className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-all ${
                    priceRange === p.id
                      ? 'bg-[#2874f0] text-white font-bold shadow-[2px_2px_6px_rgba(40,116,240,0.3)]'
                      : 'bg-[#f1f3f6] text-gray-700 hover:text-[#2874f0] shadow-[2px_2px_5px_#d1d9e6,-2px_-2px_5px_#ffffff]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Customer Rating Filter */}
            <div className="py-4 border-b border-gray-200 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">CUSTOMER RATINGS</p>
              {[4, 3].map((stars) => (
                <label
                  key={stars}
                  onClick={() => setMinRating(minRating === stars ? 0 : stars)}
                  className={`flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg cursor-pointer ${
                    minRating === stars ? 'bg-blue-50 text-[#2874f0] font-bold' : 'text-gray-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={minRating === stars}
                    readOnly
                    className="w-3.5 h-3.5 text-[#2874f0] rounded"
                  />
                  <span className="flex items-center gap-1 font-semibold">
                    {stars}★ & above
                  </span>
                </label>
              ))}
            </div>

            {/* Target BMI Suitability */}
            <div className="py-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">BMI PROFILE</p>
              {['Underweight', 'Normal', 'Overweight', 'Obese'].map((bmi) => (
                <button
                  key={bmi}
                  onClick={() => setSelectedBMI(selectedBMI === bmi ? '' : bmi)}
                  className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-all ${
                    selectedBMI === bmi
                      ? 'bg-emerald-600 text-white font-bold shadow-[2px_2px_6px_rgba(14,112,70,0.3)]'
                      : 'bg-[#f1f3f6] text-gray-700 hover:text-emerald-700 shadow-[2px_2px_5px_#d1d9e6,-2px_-2px_5px_#ffffff]'
                  }`}
                >
                  Optimized for {bmi}
                </button>
              ))}
            </div>
          </aside>

          {/* RIGHT COLUMN: Sort Tabs & Product Grid */}
          <div className="flex-1 w-full space-y-4">
            
            {/* NutriKart Sort Bar (Neomorphic Panel) */}
            <div className="bg-[#f1f3f6] rounded-xl p-3 shadow-[4px_4px_10px_#d1d9e6,-4px_-4px_10px_#ffffff] border border-white/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-gray-800">
                  Showing {filteredProducts.length} of {products.length} Products
                </span>
                {searchTerm && (
                  <span className="text-gray-500">for <strong className="text-[#2874f0]">"{searchTerm}"</strong></span>
                )}
              </div>

              {/* NutriKart Sort Options */}
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                <span className="font-bold text-gray-500 mr-1 flex items-center gap-1">
                  <ArrowUpDown size={12} /> Sort By:
                </span>
                {[
                  { id: 'popularity', label: 'Popularity' },
                  { id: 'price_asc', label: 'Price -- Low to High' },
                  { id: 'price_desc', label: 'Price -- High to Low' },
                  { id: 'rating', label: 'Customer Rating' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSortBy(s.id)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      sortBy === s.id
                        ? 'text-[#2874f0] border-b-2 border-[#2874f0] shadow-[inset_1px_1px_3px_#c5cad3,inset_-1px_-1px_3px_#ffffff] bg-blue-50/50'
                        : 'text-gray-600 hover:text-[#2874f0]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid Area */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-[#2874f0] rounded-full animate-spin mb-3"></div>
                <p className="text-sm font-semibold text-gray-500">Fetching NutriKart Catalog...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-[#f1f3f6] rounded-2xl p-12 text-center shadow-[6px_6px_14px_#d1d9e6,-6px_-6px_14px_#ffffff] border border-white/80 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-200/80 flex items-center justify-center text-gray-500 shadow-inner">
                  <Tag size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">No products match your filters</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Try clearing your category, price range, or rating filters to see more available products.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="neo-btn-blue px-6 py-2 text-xs font-bold"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {currentProducts.map((product) => {
                    const activeVariant = getProductActiveVariant(product);
                    const currentPrice = activeVariant ? activeVariant.price : product.price;
                    const originalPrice = Math.round(currentPrice * 1.45);
                    const discountPct = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
                    const wishlisted = isWishlisted(product._id);

                    return (
                      <div
                        key={product._id}
                        onClick={() => handleOpenProductModal(product)}
                        className="bg-[#f1f3f6] rounded-2xl p-3.5 shadow-[6px_6px_14px_#d1d9e6,-6px_-6px_14px_#ffffff] border border-white/90 hover:shadow-[9px_9px_18px_#c2cad8,-9px_-9px_18px_#ffffff] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer group relative"
                      >
                        {/* Floating Wishlist Button (Neomorphic Circle) */}
                        <button
                          onClick={(e) => handleToggleWishlist(product, e)}
                          className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full bg-[#f1f3f6] shadow-[2px_2px_5px_#c5cad3,-2px_-2px_5px_#ffffff] flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors active:shadow-[inset_2px_2px_4px_#c5cad3,inset_-2px_-2px_4px_#ffffff]"
                          title={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                          <Heart size={15} className={wishlisted ? "text-red-500 fill-red-500" : ""} />
                        </button>

                        {/* Recessed Product Image Frame (Neomorphic Inset) */}
                        <div>
                          <div className="w-full aspect-square rounded-xl bg-white p-3 mb-3 shadow-[inset_2px_2px_5px_#e0e6ed,inset_-2px_-2px_5px_#ffffff] flex items-center justify-center overflow-hidden relative">
                            <img
                              src={resolveProductImage(product.image, product.category)}
                              alt={product.name}
                              className="max-h-full max-w-full object-contain group-hover:scale-108 transition-transform duration-300"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = getCategoryFallback(product.category);
                              }}
                            />
                            {product.stock <= 5 && (
                              <span className="absolute bottom-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                Only {product.stock} left!
                              </span>
                            )}
                          </div>

                          {/* Category & Title */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2874f0]">
                                {product.category}
                              </span>
                              <span className="fk-assured-badge">
                                <span>✦</span> Assured
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-[#2874f0] transition-colors" title={product.name}>
                              {product.name}
                            </h4>

                            {/* NutriKart Ratings Badge */}
                            <div className="flex items-center gap-2 pt-0.5">
                              <span className="fk-rating-badge">
                                {product.rating || 4.3} <Star size={10} className="fill-white" />
                              </span>
                              <span className="text-[11px] text-gray-500 font-medium">
                                ({(product.stock || 12) * 14 + 120})
                              </span>
                            </div>

                            {/* Size / Quantity Variation Chips */}
                            {product.variants && product.variants.length > 1 && (
                              <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold mb-1">
                                  <span>SIZE / PACK:</span>
                                  <span className="text-[#2874f0] font-black">{activeVariant?.size}</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {product.variants.map((v) => {
                                    const isSelected = activeVariant?.size === v.size;
                                    return (
                                      <button
                                        key={v.size}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSelectCardVariant(product._id, v);
                                        }}
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
                                          isSelected
                                            ? 'bg-[#2874f0] text-white shadow-sm ring-1 ring-[#2874f0]'
                                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                      >
                                        {v.size}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* NutriKart Price Breakdown */}
                            <div className="pt-1.5 flex items-baseline gap-2 flex-wrap">
                              <span className="text-base font-black text-gray-900">
                                ₹{currentPrice?.toLocaleString('en-IN')}
                              </span>
                              <span className="text-xs text-gray-400 line-through">
                                ₹{originalPrice.toLocaleString('en-IN')}
                              </span>
                              <span className="text-xs font-bold text-[#388e3c]">
                                {discountPct}% off
                              </span>
                            </div>

                            <p className="text-[11px] text-gray-500 font-medium">
                              Free delivery by <span className="font-bold text-gray-700">Tomorrow</span>
                            </p>
                          </div>
                        </div>

                        {/* Dual Neomorphic Action Buttons: Add to Cart & Buy Now */}
                        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-200/80">
                          <button
                            onClick={(e) => handleAddToCart(product, activeVariant, e)}
                            className="neo-btn-yellow py-2 px-2 text-[11px] font-black flex items-center justify-center gap-1 uppercase tracking-tight"
                            title="Add to Cart"
                          >
                            <ShoppingCart size={13} strokeWidth={2.5} />
                            <span>Add</span>
                          </button>

                          <button
                            onClick={(e) => handleBuyNow(product, activeVariant, e)}
                            className="neo-btn-orange py-2 px-2 text-[11px] font-black flex items-center justify-center gap-1 uppercase tracking-tight"
                            title="Instant Buy"
                          >
                            <Zap size={13} strokeWidth={2.5} />
                            <span>Buy Now</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Neomorphic Pagination & Results Bar */}
                {filteredProducts.length > 0 && (
                  <div className="mt-8 bg-[#f1f3f6] rounded-2xl p-4 shadow-[6px_6px_14px_#d1d9e6,-6px_-6px_14px_#ffffff] border border-white/80 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                      <span>
                        Showing <strong className="text-gray-900">{startIndex + 1}</strong> – <strong className="text-gray-900">{Math.min(startIndex + itemsPerPage, filteredProducts.length)}</strong> of <strong className="text-[#2874f0]">{filteredProducts.length}</strong> products
                      </span>
                      <span className="text-gray-300">|</span>
                      <span>Page {currentPage} of {totalPages}</span>
                    </div>

                    {/* Page Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap justify-center">
                      <button
                        onClick={() => {
                          if (currentPage > 1) {
                            setCurrentPage(prev => prev - 1);
                            window.scrollTo({ top: 250, behavior: 'smooth' });
                          }
                        }}
                        disabled={currentPage === 1}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                          currentPage === 1
                            ? 'opacity-40 cursor-not-allowed bg-gray-200/50 text-gray-400'
                            : 'bg-[#f1f3f6] shadow-[3px_3px_7px_#c5cad3,-3px_-3px_7px_#ffffff] text-gray-700 hover:text-[#2874f0] active:shadow-[inset_2px_2px_4px_#c5cad3,inset_-2px_-2px_4px_#ffffff]'
                        }`}
                        title="Previous Page"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2)
                        .map((page, idx, arr) => {
                          const prevPage = arr[idx - 1];
                          const hasGap = prevPage && page - prevPage > 1;

                          return (
                            <React.Fragment key={page}>
                              {hasGap && <span className="px-1 text-gray-400 font-bold">...</span>}
                              <button
                                onClick={() => {
                                  setCurrentPage(page);
                                  window.scrollTo({ top: 250, behavior: 'smooth' });
                                }}
                                className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                                  currentPage === page
                                    ? 'bg-[#2874f0] text-white shadow-[inset_2px_2px_4px_#1a5ecc,inset_-2px_-2px_4px_#3686ff]'
                                    : 'bg-[#f1f3f6] shadow-[3px_3px_7px_#c5cad3,-3px_-3px_7px_#ffffff] text-gray-700 hover:text-[#2874f0] active:shadow-[inset_2px_2px_4px_#c5cad3,inset_-2px_-2px_4px_#ffffff]'
                                }`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        })}

                      <button
                        onClick={() => {
                          if (currentPage < totalPages) {
                            setCurrentPage(prev => prev + 1);
                            window.scrollTo({ top: 250, behavior: 'smooth' });
                          }
                        }}
                        disabled={currentPage === totalPages}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                          currentPage === totalPages
                            ? 'opacity-40 cursor-not-allowed bg-gray-200/50 text-gray-400'
                            : 'bg-[#f1f3f6] shadow-[3px_3px_7px_#c5cad3,-3px_-3px_7px_#ffffff] text-gray-700 hover:text-[#2874f0] active:shadow-[inset_2px_2px_4px_#c5cad3,inset_-2px_-2px_4px_#ffffff]'
                        }`}
                        title="Next Page"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    {/* Items Per Page Selector */}
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                      <span>Per page:</span>
                      {[16, 24, 48, 96].map(num => (
                        <button
                          key={num}
                          onClick={() => {
                            setItemsPerPage(num);
                            setCurrentPage(1);
                          }}
                          className={`px-2.5 py-1 rounded-lg transition-all ${
                            itemsPerPage === num
                              ? 'bg-[#2874f0] text-white shadow-sm'
                              : 'bg-[#f1f3f6] shadow-[2px_2px_5px_#c5cad3,-2px_-2px_5px_#ffffff] text-gray-700 hover:text-[#2874f0]'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Product Detail Modal (NutriKart Neomorphic Style) */}
      {selectedProduct && (() => {
        const modalPrice = selectedModalVariant ? selectedModalVariant.price : selectedProduct.price;
        const modalMRP = Math.round(modalPrice * 1.45);
        const modalDiscount = Math.round(((modalMRP - modalPrice) / modalMRP) * 100);

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedProduct(null)}
            ></div>

            <div className="relative bg-[#f1f3f6] w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-[14px_14px_30px_#a3b1c6,-14px_-14px_30px_#ffffff] border border-white p-6 md:p-8 z-10 space-y-6">
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#f1f3f6] shadow-[3px_3px_8px_#c5cad3,-3px_-3px_8px_#ffffff] text-gray-600 hover:text-black flex items-center justify-center transition-transform active:scale-95"
              >
                <X size={20} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Image Frame */}
                <div className="aspect-square bg-white rounded-2xl p-6 shadow-[inset_3px_3px_8px_#dbe2ec,inset_-3px_-3px_8px_#ffffff] flex items-center justify-center">
                  <img
                    src={resolveProductImage(selectedProduct.image, selectedProduct.category)}
                    alt={selectedProduct.name}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getCategoryFallback(selectedProduct.category);
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#2874f0] uppercase tracking-wider">{selectedProduct.category}</span>
                    <span className="fk-assured-badge"><span>✦</span> Assured</span>
                  </div>

                  <h3 className="text-2xl font-black text-gray-900 leading-tight">
                    {selectedProduct.name}
                  </h3>

                  <div className="flex items-center gap-3">
                    <span className="fk-rating-badge text-sm">
                      {selectedProduct.rating || 4.4} <Star size={12} className="fill-white" />
                    </span>
                    <span className="text-xs text-gray-500 font-bold">1,894 Ratings & 421 Reviews</span>
                  </div>

                  {/* Variation Selector in Modal */}
                  {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                    <div className="space-y-2 pt-1 border-t border-b border-gray-200/80 py-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                          Select Size / Quantity / Pack:
                        </label>
                        <span className="text-xs font-bold text-[#2874f0]">
                          {selectedModalVariant?.size || 'Standard'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {selectedProduct.variants.map((v) => {
                          const isSelected = selectedModalVariant?.size === v.size;
                          return (
                            <button
                              key={v.size}
                              type="button"
                              onClick={() => setSelectedModalVariant(v)}
                              className={`p-2.5 rounded-xl text-left transition-all ${
                                isSelected
                                  ? 'bg-blue-50 border-2 border-[#2874f0] shadow-[inset_1px_1px_3px_#c5cad3,inset_-1px_-1px_3px_#ffffff]'
                                  : 'bg-white border border-gray-200 hover:border-gray-400'
                              }`}
                            >
                              <div className="text-xs font-bold text-gray-900">{v.size}</div>
                              <div className="text-xs font-black text-[#2874f0]">₹{v.price.toLocaleString('en-IN')}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-gray-900">
                      ₹{modalPrice?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      ₹{modalMRP.toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm font-bold text-[#388e3c]">{modalDiscount}% off</span>
                  </div>

                  <div className="p-3 bg-white/60 rounded-xl shadow-inner border border-gray-200/60 text-xs text-gray-700 space-y-1">
                    <p className="font-bold text-gray-900">Health & Nutrition Specs:</p>
                    <p>{selectedProduct.description}</p>
                  </div>

                  {selectedProduct.recommendedFor && selectedProduct.recommendedFor.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-bold text-gray-600">Target BMI:</span>
                      {selectedProduct.recommendedFor.map(b => (
                        <span key={b} className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          {b}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={(e) => handleToggleWishlist(selectedProduct, e)}
                      className="w-12 h-11 rounded-xl bg-[#f1f3f6] shadow-[3px_3px_7px_#c5cad3,-3px_-3px_7px_#ffffff] flex items-center justify-center text-gray-500 hover:text-red-500 active:scale-95 transition-all shrink-0"
                      title={isWishlisted(selectedProduct._id) ? "Remove from Wishlist" : "Save to Wishlist"}
                    >
                      <Heart size={18} className={isWishlisted(selectedProduct._id) ? "text-red-500 fill-red-500" : ""} />
                    </button>
                    <button
                      onClick={() => handleAddToCart(selectedProduct, selectedModalVariant)}
                      className="flex-1 neo-btn-yellow py-3 text-xs font-black uppercase flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={16} /> Add to Cart
                    </button>
                    <button
                      onClick={() => handleBuyNow(selectedProduct, selectedModalVariant)}
                      className="flex-1 neo-btn-orange py-3 text-xs font-black uppercase flex items-center justify-center gap-2"
                    >
                      <Zap size={16} /> Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Floating NutriKart Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 bg-[#212121] text-white px-5 py-3 rounded-xl shadow-[8px_8px_20px_rgba(0,0,0,0.3)] z-[200] animate-in slide-in-from-bottom-5 fade-in duration-300 flex items-center gap-3 border border-gray-700">
          {toast.type === 'success' ? (
            <Check className="text-[#ffe500]" size={20} strokeWidth={3} />
          ) : (
            <AlertCircle className="text-[#fb641b]" size={20} strokeWidth={3} />
          )}
          <span className="font-bold text-xs md:text-sm">{toast.message}</span>
        </div>
      )}

      {/* NutriKart Brand Footer */}
      <NutriFooter />
    </div>
  );
};

export default Products;

