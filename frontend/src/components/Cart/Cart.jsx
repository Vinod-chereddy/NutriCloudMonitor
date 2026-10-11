import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cartAPI, orderAPI, ASSET_URL } from '../../services/api';
import { 
  Trash2, ShoppingBag, ShieldCheck, ArrowRight, 
  MapPin, CheckCircle2, AlertCircle, Plus, Minus, Zap 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NutriNavbar from '../Common/NutriNavbar';
import NutriFooter from '../Common/NutriFooter';
import CheckoutModal from './CheckoutModal';
import { resolveProductImage, getCategoryFallback } from '../../utils/imageHelper';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [savedForLater, setSavedForLater] = useState([]);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchCart();
    const params = new URLSearchParams(location.search);
    if (params.get('checkout') === 'true') {
      setShowCheckoutModal(true);
    }
  }, [location.search]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      setCart(response.data?.cart);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, currentQuantity, change, selectedVariant) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;

    try {
      await cartAPI.updateCartItem(productId, newQuantity, selectedVariant);
      fetchCart();
    } catch (error) {
      setToast({ show: true, message: 'Failed to update quantity', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 3000);
    }
  };

  const removeItem = async (productId, name, selectedVariant) => {
    try {
      await cartAPI.removeFromCart(productId, selectedVariant);
      fetchCart();
      setToast({ show: true, message: `Removed ${name || 'item'} from cart`, type: 'success' });
      setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    } catch (error) {
      setToast({ show: true, message: 'Failed to remove item', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 3000);
    }
  };

  const saveForLaterItem = (item) => {
    setSavedForLater(prev => [...prev, item]);
    removeItem(item.product?._id || item.product, item.product?.name, item.selectedVariant);
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      await orderAPI.createOrder({
        shippingAddress: '123 Health St, Wellness Colony, Bengaluru, Karnataka, 560103'
      });
      fetchCart();
      setToast({ 
        show: true, 
        message: 'Order Placed Successfully! Thank you for shopping on NutriKart Health.', 
        type: 'success' 
      });
      setTimeout(() => {
        setToast({ show: false, message: '', type: 'success' });
        navigate('/dashboard');
      }, 3500);
    } catch (error) {
      setToast({ 
        show: true, 
        message: error.response?.data?.message || 'Checkout failed. Please try again.', 
        type: 'error' 
      });
      setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 5000);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const items = cart?.items || [];
  const totalItems = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const totalPrice = cart?.totalPrice || items.reduce((acc, item) => acc + ((item.price || item.product?.price || 0) * (item.quantity || 1)), 0);
  const totalMRP = Math.round(totalPrice * 1.45);
  const totalDiscount = totalMRP - totalPrice;

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-[#212121] font-sans flex flex-col selection:bg-[#2874f0] selection:text-white">
      {/* NutriKart Brand Navigation Header */}
      <NutriNavbar />

      {/* Main NutriKart Cart Area */}
      <main className="max-w-7xl w-full mx-auto px-3 md:px-6 py-5 flex-1">
        
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-[#2874f0] rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-bold text-gray-500">Loading your NutriKart Health Cart...</p>
          </div>
        ) : items.length === 0 ? (
          /* Empty Cart State (NutriKart Style) */
          <div className="bg-[#f1f3f6] rounded-3xl p-10 md:p-16 text-center shadow-[8px_8px_20px_#d1d9e6,-8px_-8px_20px_#ffffff] border border-white/80 max-w-2xl mx-auto my-8 space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-[#f1f3f6] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center text-[#2874f0]">
              <ShoppingBag size={48} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your Cart is Empty!</h2>
            <p className="text-xs md:text-sm text-gray-500 font-medium max-w-sm mx-auto">
              Explore our curated nutrition supplements, protein isolates, and fitness equipment to build your health cart.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/products')}
                className="neo-btn-blue px-8 py-3 text-xs md:text-sm font-black uppercase tracking-wider shadow-lg"
              >
                Shop Health Products Now
              </button>
            </div>
          </div>
        ) : (
          /* 2-Column NutriKart Cart Layout */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* LEFT 2 COLUMNS: Address Bar & Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* NutriKart Deliver To Address Bar */}
              <div className="bg-[#f1f3f6] rounded-2xl p-4 shadow-[4px_4px_10px_#d1d9e6,-4px_-4px_10px_#ffffff] border border-white/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-[#2874f0] shadow-inner">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Deliver to:</p>
                    <p className="text-sm font-bold text-gray-900">
                      {user?.name || 'Customer'}, <span className="font-mono text-gray-600">560103</span>
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => alert('Delivery address is set to your primary profile location.')}
                  className="neo-btn px-4 py-1.5 text-xs font-bold text-[#2874f0] border border-blue-200/50"
                >
                  Change
                </button>
              </div>

              {/* Cart Items List */}
              <div className="bg-[#f1f3f6] rounded-3xl p-4 md:p-6 shadow-[8px_8px_20px_#d1d9e6,-8px_-8px_20px_#ffffff] border border-white/80 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <h3 className="text-base font-black text-gray-900">
                    NutriKart Health Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                  </h3>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck size={14} /> 100% Genuine Guaranteed
                  </span>
                </div>

                {items.map((item) => {
                  const prod = item.product || {};
                  const price = item.price || prod.price || 0;
                  const itemMRP = Math.round(price * 1.45);
                  const itemDiscount = Math.round(((itemMRP - price) / itemMRP) * 100);

                  return (
                    <div 
                      key={item._id || prod._id}
                      className="py-4 border-b border-gray-200/80 last:border-b-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      {/* Product details */}
                      <div className="flex items-start gap-4 flex-1">
                        {/* Recessed Image */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl p-2 shadow-[inset_2px_2px_4px_#e0e6ed,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center shrink-0">
                          <img
                            src={resolveProductImage(prod.image, prod.category)}
                            alt={prod.name}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = getCategoryFallback(prod.category);
                            }}
                          />
                        </div>

                        {/* Title, Pricing & Badges */}
                        <div className="space-y-1">
                          <h4 className="text-sm md:text-base font-bold text-gray-900 line-clamp-1">
                            {prod.name}
                          </h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            {item.selectedVariant && (
                              <span className="inline-flex items-center text-[11px] font-bold bg-blue-50 text-[#2874f0] px-2 py-0.5 rounded-md border border-blue-200">
                                Size / Pack: {item.selectedVariant}
                              </span>
                            )}
                            <span className="text-[11px] text-gray-500 font-medium">Seller: HealthCart Retail</span>
                            <span className="fk-assured-badge">✦ Assured</span>
                          </div>

                          <div className="flex items-baseline gap-2 pt-1">
                            <span className="text-base font-black text-gray-900">
                              ₹{(price * (item.quantity || 1)).toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                              ₹{(itemMRP * (item.quantity || 1)).toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs font-bold text-[#388e3c]">
                              {itemDiscount}% off
                            </span>
                          </div>

                          <p className="text-[11px] text-gray-500 font-medium">
                            Delivery by <span className="font-bold text-gray-700">Tomorrow, 11:00 PM</span> | <span className="text-[#388e3c] font-bold">Free</span>
                          </p>
                        </div>
                      </div>

                      {/* Stepper & Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0">
                        {/* Neomorphic Stepper: [-] [ Qty ] [+] */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(prod._id || item.productId, item.quantity, -1, item.selectedVariant)}
                            disabled={item.quantity <= 1}
                            className="w-7 h-7 rounded-full bg-[#f1f3f6] shadow-[2px_2px_5px_#c5cad3,-2px_-2px_5px_#ffffff] flex items-center justify-center text-gray-700 hover:text-black active:shadow-[inset_2px_2px_4px_#c5cad3,inset_-2px_-2px_4px_#ffffff] disabled:opacity-40 transition-all"
                            title="Decrease quantity"
                          >
                            <Minus size={13} strokeWidth={2.5} />
                          </button>

                          <div className="w-9 h-7 rounded-lg bg-[#f1f3f6] shadow-[inset_2px_2px_4px_#c5cad3,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-xs font-black text-gray-900">
                            {item.quantity}
                          </div>

                          <button
                            onClick={() => updateQuantity(prod._id || item.productId, item.quantity, 1, item.selectedVariant)}
                            className="w-7 h-7 rounded-full bg-[#f1f3f6] shadow-[2px_2px_5px_#c5cad3,-2px_-2px_5px_#ffffff] flex items-center justify-center text-gray-700 hover:text-black active:shadow-[inset_2px_2px_4px_#c5cad3,inset_-2px_-2px_4px_#ffffff] transition-all"
                            title="Increase quantity"
                          >
                            <Plus size={13} strokeWidth={2.5} />
                          </button>
                        </div>

                        {/* Action links */}
                        <div className="flex items-center gap-4 text-xs font-bold pt-1">
                          <button
                            onClick={() => saveForLaterItem(item)}
                            className="text-gray-600 hover:text-[#2874f0] transition-colors"
                          >
                            SAVE FOR LATER
                          </button>
                          <button
                            onClick={() => removeItem(prod._id || item.productId, prod.name, item.selectedVariant)}
                            className="text-gray-600 hover:text-red-600 transition-colors flex items-center gap-1"
                          >
                            <Trash2 size={13} />
                            <span>REMOVE</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Sticky / Bottom Place Order Trigger */}
                <div className="pt-4 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={() => setShowCheckoutModal(true)}
                    className="w-full sm:w-64 neo-btn-orange py-3.5 text-xs md:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                  >
                    <Zap size={16} strokeWidth={2.5} />
                    <span>PLACE ORDER</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: NutriKart Price Details Summary */}
            <aside className="bg-[#f1f3f6] rounded-3xl p-5 md:p-6 shadow-[8px_8px_20px_#d1d9e6,-8px_-8px_20px_#ffffff] border border-white/80 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 pb-3 border-b border-gray-200">
                PRICE DETAILS
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-gray-700">
                  <span>Price ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                  <span className="font-bold">₹{totalMRP.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center text-gray-700">
                  <span>Discount</span>
                  <span className="font-bold text-[#388e3c]">− ₹{totalDiscount.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center text-gray-700">
                  <span>Delivery Charges</span>
                  <span className="font-bold text-[#388e3c]">FREE</span>
                </div>

                <div className="pt-3 border-t border-dashed border-gray-300 flex justify-between items-baseline font-black text-base md:text-lg text-gray-900">
                  <span>Total Amount</span>
                  <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Savings Announcement */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs font-bold text-[#388e3c] text-center shadow-inner">
                🎉 You will save ₹{totalDiscount.toLocaleString('en-IN')} on this order!
              </div>

              {/* Trust Badge */}
              <div className="pt-2 text-xs text-gray-500 flex items-start gap-2.5">
                <ShieldCheck size={20} className="text-[#2874f0] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Safe and Secure Payments. 14 Days Easy Returns. 100% Authentic Nutrition Guaranteed by NutriKart.
                </p>
              </div>
            </aside>

          </div>
        )}

      </main>

      {/* Floating NutriKart Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 bg-[#212121] text-white px-5 py-3 rounded-xl shadow-[8px_8px_20px_rgba(0,0,0,0.3)] z-[200] animate-in slide-in-from-bottom-5 fade-in duration-300 flex items-center gap-3 border border-gray-700">
          {toast.type === 'error' ? (
            <AlertCircle className="text-[#fb641b]" size={20} />
          ) : (
            <CheckCircle2 className="text-[#ffe500]" size={20} />
          )}
          <span className="font-bold text-xs md:text-sm">{toast.message}</span>
        </div>
      )}

      {/* Comprehensive Neomorphic Payment & Checkout System Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        items={items}
        totalPrice={totalPrice}
        totalMRP={totalMRP}
        totalDiscount={totalDiscount}
        user={user}
        onOrderSuccess={(orderData) => {
          fetchCart();
          setToast({
            show: true,
            message: 'Order Placed Successfully via UPI / Secure Payment!',
            type: 'success'
          });
          setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
        }}
      />

      {/* NutriKart Brand Footer */}
      <NutriFooter />
    </div>
  );
};

export default Cart;

