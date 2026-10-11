import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Search, Clock, Truck, CheckCircle2, XCircle, 
  ChevronRight, ArrowRight, Download, Star, AlertCircle, 
  MapPin, RefreshCw, ShoppingBag, ShieldCheck, Printer, X, Eye
} from 'lucide-react';
import { orderAPI, cartAPI, authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import NutriNavbar from '../Common/NutriNavbar';
import NutriFooter from '../Common/NutriFooter';
import { resolveProductImage, getCategoryFallback } from '../../utils/imageHelper';

const Orders = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED'
  const [timeFilter, setTimeFilter] = useState('ALL'); // 'ALL', '30_DAYS', '2026'

  // Modals state
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Found better price elsewhere');
  const [reviewOrderData, setReviewOrderData] = useState(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderAPI.getUserOrders();
      setOrders(res.data?.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      showToast('Failed to load order history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      const res = await authAPI.login({ email: 'user@healthcart.com', password: 'user123' });
      if (res.data?.token) {
        login(res.data.user, res.data.token);
        showToast('Signed in successfully! Loading orders...');
        const ordersRes = await orderAPI.getUserOrders();
        setOrders(ordersRes.data?.orders || []);
      }
    } catch (err) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  const handleCancelOrder = async () => {
    if (!cancellingOrder) return;
    setSubmittingAction(true);
    try {
      await orderAPI.cancelOrder(cancellingOrder._id, cancelReason);
      showToast('Order successfully cancelled');
      setCancellingOrder(null);
      fetchOrders();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel order', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleSaveReview = async () => {
    if (!reviewOrderData) return;
    setSubmittingAction(true);
    try {
      await orderAPI.reviewOrder(reviewOrderData._id, ratingVal, reviewText);
      showToast('Thank you! Your product review has been submitted.');
      setReviewOrderData(null);
      setReviewText('');
      fetchOrders();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleBuyAgain = async (item) => {
    try {
      const prodId = item.productId?._id || item.productId;
      await cartAPI.addToCart({
        productId: prodId,
        quantity: item.quantity || 1,
        selectedVariant: item.selectedVariant || '',
        price: item.price
      });
      window.dispatchEvent(new Event('cartUpdated'));
      navigate('/cart');
    } catch (err) {
      showToast('Could not re-add product to cart', 'error');
    }
  };

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    // Search match
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchesId = order._id?.toLowerCase().includes(q) || order.trackingId?.toLowerCase().includes(q);
      const matchesItem = order.items?.some((i) => (i.name || i.productId?.name || '').toLowerCase().includes(q));
      if (!matchesId && !matchesItem) return false;
    }

    // Status filter
    const status = order.orderStatus || 'Order Confirmed';
    if (statusFilter === 'ON_THE_WAY') {
      if (['Delivered', 'Cancelled'].includes(status)) return false;
    } else if (statusFilter === 'DELIVERED') {
      if (status !== 'Delivered') return false;
    } else if (statusFilter === 'CANCELLED') {
      if (status !== 'Cancelled') return false;
    }

    // Time filter
    if (timeFilter === '30_DAYS') {
      const orderDate = new Date(order.createdAt);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      if (orderDate < thirtyDaysAgo) return false;
    }

    return true;
  });

  const getStatusBadge = (status = 'Order Confirmed') => {
    switch (status) {
      case 'Delivered':
        return {
          bg: 'bg-emerald-500',
          text: 'text-emerald-700',
          pillBg: 'bg-emerald-50 border-emerald-200',
          label: 'Delivered',
          desc: 'Your item has been delivered safely.'
        };
      case 'Cancelled':
        return {
          bg: 'bg-red-500',
          text: 'text-red-700',
          pillBg: 'bg-red-50 border-red-200',
          label: 'Cancelled',
          desc: 'Order was cancelled as requested.'
        };
      case 'Out for Delivery':
        return {
          bg: 'bg-amber-500',
          text: 'text-amber-800',
          pillBg: 'bg-amber-50 border-amber-200',
          label: 'Out for Delivery',
          desc: 'Courier executive is on the way.'
        };
      case 'Shipped':
        return {
          bg: 'bg-blue-500',
          text: 'text-blue-700',
          pillBg: 'bg-blue-50 border-blue-200',
          label: 'Shipped',
          desc: 'In transit via Ekart Logistics.'
        };
      case 'Packed':
        return {
          bg: 'bg-indigo-500',
          text: 'text-indigo-700',
          pillBg: 'bg-indigo-50 border-indigo-200',
          label: 'Packed',
          desc: 'Packed at NutriKart Fulfillment Hub.'
        };
      default:
        return {
          bg: 'bg-[#2874f0]',
          text: 'text-[#2874f0]',
          pillBg: 'bg-blue-50 border-blue-200',
          label: 'Order Confirmed',
          desc: 'Payment confirmed. Arriving within 3 days.'
        };
    }
  };

  const steps = ['Order Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

  const getStepIndex = (currentStatus = 'Order Confirmed') => {
    if (currentStatus === 'Cancelled') return -1;
    const idx = steps.indexOf(currentStatus);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-[#212121] font-sans flex flex-col selection:bg-[#2874f0] selection:text-white">
      {/* NutriNavbar */}
      <NutriNavbar />

      {/* Main Body */}
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 flex-1">
        
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-4">
          <span className="hover:text-[#2874f0] cursor-pointer" onClick={() => navigate('/products')}>Home</span>
          <span>&gt;</span>
          <span className="hover:text-[#2874f0] cursor-pointer" onClick={() => navigate('/dashboard')}>My Account</span>
          <span>&gt;</span>
          <span className="text-gray-900 font-bold">My Orders</span>
        </div>

        {!isAuthenticated ? (
          <div className="bg-[#f1f3f6] rounded-3xl p-8 sm:p-14 text-center shadow-[6px_6px_16px_#c5cad3,-6px_-6px_16px_#ffffff] border border-white max-w-xl mx-auto my-10 space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#f1f3f6] shadow-[inset_3px_3px_6px_#c5cad3,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center text-[#2874f0]">
              <Package size={40} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Sign In to View Orders</h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">
              Track your active nutrition shipments, download tax invoices, and rate your products with NutriKart.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="neo-btn-blue px-7 py-3 text-xs sm:text-sm font-black uppercase tracking-wider shadow-md active:scale-95"
              >
                Sign In to Account
              </button>
              <button
                onClick={handleDemoLogin}
                className="neo-btn-orange px-7 py-3 text-xs sm:text-sm font-black uppercase tracking-wider shadow-md active:scale-95"
              >
                Instant Demo Sign In
              </button>
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* ======================================================== */}
          {/* LEFT SIDEBAR FILTERS (Flipkart Style) */}
          {/* ======================================================== */}
          <aside className="lg:col-span-1 space-y-5">
            <div className="bg-[#f1f3f6] rounded-2xl p-5 shadow-[6px_6px_16px_#c5cad3,-6px_-6px_16px_#ffffff] border border-white space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <h2 className="text-sm font-black text-gray-900 tracking-wide uppercase">Filters</h2>
                {(statusFilter !== 'ALL' || timeFilter !== 'ALL') && (
                  <button
                    onClick={() => { setStatusFilter('ALL'); setTimeFilter('ALL'); }}
                    className="text-xs text-[#2874f0] font-bold hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Order Status Filter */}
              <div>
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Order Status</h3>
                <div className="space-y-2 text-xs font-bold text-gray-700">
                  {[
                    { id: 'ALL', label: 'All Orders' },
                    { id: 'ON_THE_WAY', label: 'On the way' },
                    { id: 'DELIVERED', label: 'Delivered' },
                    { id: 'CANCELLED', label: 'Cancelled' },
                  ].map((opt) => (
                    <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer hover:text-black">
                      <input
                        type="radio"
                        name="orderStatus"
                        checked={statusFilter === opt.id}
                        onChange={() => setStatusFilter(opt.id)}
                        className="accent-[#2874f0] w-4 h-4 cursor-pointer"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Order Time Filter */}
              <div className="pt-2 border-t border-gray-200/70">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Order Time</h3>
                <div className="space-y-2 text-xs font-bold text-gray-700">
                  {[
                    { id: 'ALL', label: 'Anytime' },
                    { id: '30_DAYS', label: 'Last 30 days' },
                    { id: '2026', label: 'Year 2026' },
                  ].map((opt) => (
                    <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer hover:text-black">
                      <input
                        type="radio"
                        name="orderTime"
                        checked={timeFilter === opt.id}
                        onChange={() => setTimeFilter(opt.id)}
                        className="accent-[#2874f0] w-4 h-4 cursor-pointer"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* NutriKart Buyer Protection Callout */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs space-y-1 text-gray-600">
                <div className="flex items-center gap-1.5 text-[#2874f0] font-black">
                  <ShieldCheck size={16} />
                  <span>100% Buyer Guarantee</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Every order includes authentic manufacturer verification and tamper-evident packaging.
                </p>
              </div>

            </div>
          </aside>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: ORDERS LIST & SEARCH */}
          {/* ======================================================== */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Search Orders Bar (Flipkart Style) */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search your orders by product name or Order ID..."
                className="w-full bg-[#f1f3f6] text-[#212121] placeholder-gray-500 text-xs sm:text-sm py-3 pl-4 pr-11 rounded-xl shadow-[inset_2px_2px_5px_#c5cad3,inset_-2px_-2px_5px_#ffffff] border border-white focus:outline-none focus:ring-2 focus:ring-[#2874f0] transition-all font-medium"
              />
              <div className="absolute right-3.5 top-0 bottom-0 flex items-center text-[#2874f0]">
                <Search size={18} strokeWidth={2.5} />
              </div>
            </div>

            {/* Orders Feed */}
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center space-y-3">
                <div className="w-10 h-10 border-4 border-gray-300 border-t-[#2874f0] rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-gray-500">Retrieving your NutriKart orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              /* Empty Orders State */
              <div className="bg-[#f1f3f6] rounded-3xl p-10 md:p-14 text-center shadow-[6px_6px_16px_#c5cad3,-6px_-6px_16px_#ffffff] border border-white space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-[#f1f3f6] shadow-[inset_3px_3px_6px_#c5cad3,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center text-[#2874f0]">
                  <ShoppingBag size={38} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">No Orders Placed Yet</h3>
                <p className="text-xs sm:text-sm text-gray-500 font-medium max-w-sm mx-auto">
                  You haven't ordered any health supplements or gear yet. Explore top nutrition picks!
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => navigate('/products')}
                    className="neo-btn-orange px-8 py-3 text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg"
                  >
                    Start Shopping Now
                  </button>
                </div>
              </div>
            ) : (
              /* Order Cards List */
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const badge = getStatusBadge(order.orderStatus);
                  const activeStepIdx = getStepIndex(order.orderStatus);
                  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <div
                      key={order._id}
                      className="bg-[#f1f3f6] rounded-2xl p-4 sm:p-6 shadow-[6px_6px_16px_#c5cad3,-6px_-6px_16px_#ffffff] border border-white space-y-4 hover:shadow-[8px_8px_20px_#b8bfc9,-8px_-8px_20px_#ffffff] transition-all"
                    >
                      {/* Order Card Top Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-200 text-xs">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 font-bold text-gray-600">
                          <div>
                            <span className="text-gray-400 font-medium">Order ID: </span>
                            <span className="text-gray-900 font-black">
                              {(order._id ? order._id.toString() : 'ORD').slice(-8).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-gray-300">|</span>
                          <div>
                            <span className="text-gray-400 font-medium">Placed: </span>
                            <span>{formattedDate}</span>
                          </div>
                          <span className="text-gray-300">|</span>
                          <div>
                            <span className="text-gray-400 font-medium">Payment: </span>
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              {order.paymentMethod || 'UPI'} (Paid)
                            </span>
                          </div>
                        </div>

                        {/* Top Action Pills */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setInvoiceOrder(order)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#f1f3f6] shadow-[2px_2px_5px_#c5cad3,-2px_-2px_5px_#ffffff] text-xs font-bold text-gray-700 hover:text-[#2874f0] active:scale-95 transition-all"
                            title="View / Download Invoice"
                          >
                            <Printer size={13} />
                            <span>Invoice</span>
                          </button>
                        </div>
                      </div>

                      {/* Items in this Order */}
                      <div className="space-y-4">
                        {order.items?.map((item, idx) => {
                          const prod = (typeof item.productId === 'object' && item.productId) ? item.productId : {};
                          const imgSrc = resolveProductImage(prod.image || prod, prod.category);
                          const fallbackSrc = getCategoryFallback(prod.category || 'Supplements');

                          return (
                            <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                              
                              {/* Left: Product Thumbnail & Details */}
                              <div className="flex items-center gap-4 flex-1">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white p-1.5 shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                                  <img
                                    src={imgSrc}
                                    alt={item.name || prod.name}
                                    className="w-full h-full object-contain mix-blend-multiply"
                                    onError={(e) => { e.target.src = fallbackSrc; }}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-xs sm:text-sm font-black text-gray-900 leading-snug hover:text-[#2874f0] cursor-pointer" onClick={() => navigate('/products')}>
                                    {item.name || prod.name}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-gray-500">
                                    {item.selectedVariant && (
                                      <span className="bg-gray-200/70 text-gray-700 px-2 py-0.5 rounded text-[10px]">
                                        Variant: {item.selectedVariant}
                                      </span>
                                    )}
                                    <span>Qty: {item.quantity || 1}</span>
                                    <span>•</span>
                                    <span className="text-gray-900 font-black">₹{item.price?.toLocaleString('en-IN')}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Middle: Live Order Status Info (Flipkart Style) */}
                              <div className="w-full sm:w-56 shrink-0 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2.5 h-2.5 rounded-full ${badge.bg} animate-pulse shrink-0`}></span>
                                  <span className={`text-xs font-black ${badge.text}`}>
                                    {badge.label}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-500 font-medium leading-tight">
                                  {badge.desc}
                                </p>
                              </div>

                              {/* Right: Actions Column (Track / Rate / Cancel) */}
                              <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200">
                                <button
                                  onClick={() => setSelectedTrackingOrder(order)}
                                  className="neo-btn-blue text-[11px] font-black uppercase px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md active:scale-95"
                                >
                                  <Truck size={13} />
                                  <span>Track Package</span>
                                </button>

                                <div className="flex items-center gap-2 text-xs font-bold">
                                  {order.orderStatus === 'Delivered' && (
                                    <button
                                      onClick={() => setReviewOrderData(order)}
                                      className="text-[#2874f0] hover:underline flex items-center gap-1"
                                    >
                                      <Star size={12} className="fill-[#2874f0]" />
                                      <span>Rate & Review</span>
                                    </button>
                                  )}

                                  {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' && (
                                    <button
                                      onClick={() => setCancellingOrder(order)}
                                      className="text-gray-500 hover:text-red-600 transition-colors"
                                    >
                                      Cancel Order
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleBuyAgain(item)}
                                    className="text-gray-600 hover:text-[#2874f0] transition-colors"
                                  >
                                    Buy Again
                                  </button>
                                </div>
                              </div>

                            </div>
                          );
                        })}
                      </div>

                      {/* Flipkart-Style Stepper Progress Bar */}
                      {order.orderStatus !== 'Cancelled' && (
                        <div className="pt-3 border-t border-gray-200/80">
                          <div className="relative flex items-center justify-between max-w-xl mx-auto px-4 py-2">
                            {/* Background tracking line */}
                            <div className="absolute top-1/2 left-8 right-8 h-1 bg-gray-300 -translate-y-1/2 z-0 rounded-full"></div>
                            {/* Active filled tracking line */}
                            <div 
                              className="absolute top-1/2 left-8 h-1 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500 rounded-full"
                              style={{ width: `${(Math.max(activeStepIdx, 0) / (steps.length - 1)) * 88}%` }}
                            ></div>

                            {steps.map((st, sIdx) => {
                              const isCompleted = sIdx <= activeStepIdx;
                              const isCurrent = sIdx === activeStepIdx;

                              return (
                                <div key={st} className="relative z-10 flex flex-col items-center">
                                  <div 
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                                      isCompleted 
                                        ? 'bg-emerald-500 text-white shadow-md' 
                                        : 'bg-white border-2 border-gray-300 text-gray-400'
                                    } ${isCurrent ? 'ring-4 ring-emerald-200 scale-110' : ''}`}
                                  >
                                    {isCompleted ? '✓' : sIdx + 1}
                                  </div>
                                  <span className={`text-[10px] font-bold mt-1.5 hidden md:block ${isCompleted ? 'text-emerald-700' : 'text-gray-400'}`}>
                                    {st}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Order Total Footer Bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200/70 text-xs text-gray-500">
                        <div>
                          <span>Delivery Address: </span>
                          <span className="font-semibold text-gray-700">{order.shippingAddress}</span>
                        </div>
                        <div className="font-bold text-gray-900 text-sm">
                          <span>Total Amount: </span>
                          <span className="text-[#2874f0] font-black">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
        )}

      </main>

      {/* ======================================================== */}
      {/* MODAL 1: LIVE PACKAGE TRACKING MODAL */}
      {/* ======================================================== */}
      {selectedTrackingOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTrackingOrder(null)}></div>
          <div className="relative bg-[#f1f3f6] w-full max-w-xl rounded-3xl p-6 md:p-8 shadow-[12px_12px_30px_#a3b1c6,-12px_-12px_30px_#ffffff] border border-white z-10 space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#2874f0] flex items-center justify-center shadow-inner">
                  <Truck size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">Live Package Tracking</h3>
                  <p className="text-xs text-gray-500">
                    AWB: {selectedTrackingOrder.trackingId || 'EKART-IN-89217894'} • {selectedTrackingOrder.courier || 'Ekart Logistics'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTrackingOrder(null)} 
                className="w-8 h-8 rounded-full bg-[#f1f3f6] shadow-[2px_2px_5px_#c5cad3,-2px_-2px_5px_#ffffff] flex items-center justify-center text-gray-600 hover:text-black"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tracking Milestones Log */}
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {(selectedTrackingOrder.trackingEvents && selectedTrackingOrder.trackingEvents.length > 0 
                ? selectedTrackingOrder.trackingEvents 
                : [
                    { status: 'Order Confirmed', location: 'Bengaluru Hub', timestamp: selectedTrackingOrder.createdAt, message: 'Order verified and payment confirmed.' },
                    { status: 'Packed', location: 'NutriKart Central Warehouse', timestamp: new Date(new Date(selectedTrackingOrder.createdAt).getTime() + 3600000), message: 'Packed with tamper-proof security tape.' },
                    { status: 'In Transit', location: 'Electronic City Sorting Facility', timestamp: new Date(new Date(selectedTrackingOrder.createdAt).getTime() + 7200000), message: 'Dispatched to local courier distribution center.' }
                  ]
              ).map((ev, eIdx) => (
                <div key={eIdx} className="flex items-start gap-3.5 relative">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-md shrink-0 z-10">
                    ✓
                  </div>
                  <div className="flex-1 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between text-xs font-black">
                      <span className="text-gray-900">{ev.status}</span>
                      <span className="text-gray-400 font-semibold">{new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">{ev.message || ev.location}</p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-1">Location: {ev.location || 'NutriKart Fulfillment Hub'}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedTrackingOrder(null)}
                className="neo-btn-blue px-6 py-2.5 text-xs font-bold uppercase rounded-xl shadow-md"
              >
                Close Tracking
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: PRINTABLE TAX INVOICE MODAL */}
      {/* ======================================================== */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setInvoiceOrder(null)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-200 z-10 space-y-6 max-h-[90vh] overflow-y-auto text-[#212121]">
            
            {/* Invoice Header */}
            <div className="flex items-start justify-between pb-4 border-b-2 border-gray-900">
              <div>
                <h2 className="text-2xl font-black italic tracking-tight text-[#2874f0]">
                  Nutri<span className="text-[#fb641b]">Kart</span> Health
                </h2>
                <p className="text-xs text-gray-500 font-semibold">Tax Invoice / Bill of Supply</p>
                <p className="text-[11px] text-gray-400">GSTIN: 29AABCN8291Q1ZT</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-black bg-blue-50 text-[#2874f0] px-2.5 py-1 rounded-full border border-blue-200">
                  ORIGINAL FOR RECIPIENT
                </span>
                <p className="text-xs font-bold text-gray-700 mt-2">
                  Invoice #: NK-INV-{(invoiceOrder._id ? invoiceOrder._id.toString() : 'ORD').slice(-6).toUpperCase()}
                </p>
                <p className="text-[11px] text-gray-400">Date: {new Date(invoiceOrder.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Bill To & Ship To Details */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <p className="font-black text-gray-500 uppercase text-[10px] mb-1">Billing & Shipping Details:</p>
                <p className="font-bold text-gray-900">{invoiceOrder.shippingAddress}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-gray-500 uppercase text-[10px] mb-1">Payment Information:</p>
                <p className="font-bold text-emerald-700">Mode: {invoiceOrder.paymentMethod || 'UPI'}</p>
                <p className="text-gray-500">Txn Ref: {invoiceOrder.paymentDetails?.transactionId || 'UPI-CONFIRMED'}</p>
                <p className="text-gray-500">Status: Completed</p>
              </div>
            </div>

            {/* Itemized Table */}
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-300 text-gray-500 font-black uppercase text-[10px]">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoiceOrder.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 font-bold text-gray-900">
                      {item.name || item.productId?.name}
                      {item.selectedVariant && (
                        <span className="block text-[10px] text-gray-500 font-medium">Variant: {item.selectedVariant}</span>
                      )}
                    </td>
                    <td className="py-2.5 text-center font-bold text-gray-700">{item.quantity || 1}</td>
                    <td className="py-2.5 text-right font-bold text-gray-700">₹{item.price?.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 text-right font-black text-gray-900">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Summary */}
            <div className="pt-3 border-t-2 border-gray-900 flex justify-between items-baseline font-black text-base">
              <span>Grand Total (INR):</span>
              <span className="text-[#2874f0]">₹{invoiceOrder.totalAmount?.toLocaleString('en-IN')}</span>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-[10px] text-gray-400">Computer generated invoice. Requires no physical signature.</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-black active:scale-95"
                >
                  <Printer size={14} />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setInvoiceOrder(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 text-xs font-bold rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: CANCEL ORDER CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !submittingAction && setCancellingOrder(null)}></div>
          <div className="relative bg-[#f1f3f6] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-white z-10 space-y-4">
            
            <div className="flex items-center gap-3 text-red-600 pb-2 border-b border-gray-200">
              <AlertCircle size={24} />
              <h3 className="text-base font-black text-gray-900">Cancel Order Request</h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              Are you sure you want to cancel order <span className="font-bold text-gray-900">#{(cancellingOrder._id ? cancellingOrder._id.toString() : 'ORD').slice(-6).toUpperCase()}</span>? If payment was made via UPI or Card, refund will be processed within 2-4 business days.
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Reason for cancellation:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-xs font-bold p-2.5 rounded-xl bg-white border border-gray-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="Found better price elsewhere">Found better price elsewhere</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Expected faster delivery">Expected faster delivery</option>
                <option value="Need to change delivery address">Need to change delivery address</option>
                <option value="Other reasons">Other reasons</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setCancellingOrder(null)}
                disabled={submittingAction}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-black"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={submittingAction}
                className="px-5 py-2.5 bg-red-600 text-white text-xs font-black uppercase rounded-xl hover:bg-red-700 shadow-md active:scale-95 disabled:opacity-50"
              >
                {submittingAction ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: RATE & REVIEW MODAL */}
      {/* ======================================================== */}
      {reviewOrderData && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !submittingAction && setReviewOrderData(null)}></div>
          <div className="relative bg-[#f1f3f6] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-white z-10 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Star size={20} className="text-[#ffe500] fill-[#ffe500]" />
                <h3 className="text-base font-black text-gray-900">Rate & Review Product</h3>
              </div>
              <button onClick={() => setReviewOrderData(null)}>
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Stars selection */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Your Rating:</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingVal(star)}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    <Star
                      size={28}
                      className={star <= ratingVal ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                    />
                  </button>
                ))}
                <span className="text-xs font-black text-gray-700 ml-2">{ratingVal} / 5 Stars</span>
              </div>
            </div>

            {/* Review text */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Your Review / Feedback:</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your honest review on product taste, packaging, and effectiveness..."
                rows={3}
                className="w-full text-xs font-medium p-3 rounded-xl bg-white border border-gray-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
              ></textarea>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setReviewOrderData(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReview}
                disabled={submittingAction}
                className="neo-btn-blue px-6 py-2.5 text-xs font-black uppercase rounded-xl shadow-md disabled:opacity-50"
              >
                {submittingAction ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 bg-[#212121] text-white px-5 py-3 rounded-xl shadow-2xl z-[200] animate-in slide-in-from-bottom-5 fade-in duration-300 flex items-center gap-3 border border-gray-700">
          {toast.type === 'error' ? (
            <XCircle className="text-red-500" size={20} />
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

export default Orders;
