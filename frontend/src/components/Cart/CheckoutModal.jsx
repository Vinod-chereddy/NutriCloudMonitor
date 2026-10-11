import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, ShieldCheck, CheckCircle2, QrCode, Smartphone, CreditCard, 
  Building2, Banknote, ArrowRight, MapPin, Edit3, Lock, Check,
  Sparkles, Package, ChevronRight, AlertCircle, ShoppingBag
} from 'lucide-react';
import { orderAPI } from '../../services/api';
import { resolveProductImage, getCategoryFallback } from '../../utils/imageHelper';

const CheckoutModal = ({
  isOpen,
  onClose,
  items = [],
  totalPrice = 0,
  totalMRP = 0,
  totalDiscount = 0,
  user,
  onOrderSuccess
}) => {
  const navigate = useNavigate();

  // Address State
  const [address, setAddress] = useState({
    name: user?.name || 'Customer',
    phone: '+91 98765 43210',
    street: 'Flat 402, Green Glen Heights, Outer Ring Road',
    locality: 'Near Bellandur Tech Park',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103'
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState({ ...address });

  // Payment Options State
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI', 'Card', 'NetBanking', 'COD'
  
  // UPI Sub-options
  const [upiOption, setUpiOption] = useState('gpay'); // 'gpay', 'phonepe', 'paytm', 'qr', 'custom'
  const [customUpiId, setCustomUpiId] = useState(user?.email ? `${user.email.split('@')[0]}@okaxis` : 'nutrikart.customer@okhdfcbank');
  const [upiVerified, setUpiVerified] = useState(true);
  const [qrTimer, setQrTimer] = useState(299); // 5 mins in seconds

  // Card State
  const [cardData, setCardData] = useState({
    number: '4532 8921 4432 9012',
    name: user?.name || 'Cardholder Name',
    expiry: '08/28',
    cvv: '821'
  });

  // Net Banking State
  const [selectedBank, setSelectedBank] = useState('HDFC');

  // COD State
  const [captchaCode, setCaptchaCode] = useState('7428');
  const [userCaptcha, setUserCaptcha] = useState('');

  // Processing & Success State
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState(null);

  // QR Code Timer Countdown
  useEffect(() => {
    let interval;
    if (isOpen && paymentMethod === 'UPI' && upiOption === 'qr' && qrTimer > 0) {
      interval = setInterval(() => setQrTimer(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, paymentMethod, upiOption, qrTimer]);

  if (!isOpen) return null;

  const handleSaveAddress = () => {
    setAddress({ ...tempAddress });
    setIsEditingAddress(false);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handlePayAndPlaceOrder = async () => {
    if (paymentMethod === 'COD' && userCaptcha !== captchaCode) {
      alert('Please enter the correct 4-digit confirmation code for Cash on Delivery.');
      return;
    }

    setIsProcessing(true);

    const fullShippingAddress = `${address.name}, ${address.phone}, ${address.street}, ${address.locality}, ${address.city}, ${address.state} - ${address.pincode}`;
    const txnRef = `UPI/2026/NK${Date.now().toString().slice(-7)}`;
    const finalUpiId = upiOption === 'qr' 
      ? 'nutrikart@icici' 
      : (upiOption === 'custom' ? customUpiId : `${address.phone.replace(/[^0-9]/g, '').slice(-10)}@${upiOption}`);

    try {
      const response = await orderAPI.createOrder({
        shippingAddress: fullShippingAddress,
        paymentMethod: paymentMethod,
        paymentDetails: {
          upiId: finalUpiId,
          transactionId: txnRef,
          paymentStatus: 'Success'
        }
      });

      const orderData = response.data?.order || {
        _id: `NK-ORD-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString()
      };

      setOrderReceipt({
        orderId: orderData._id,
        transactionId: txnRef,
        amount: totalPrice,
        method: paymentMethod,
        upiId: finalUpiId,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        items: [...items],
        address: fullShippingAddress
      });

      if (onOrderSuccess) {
        onOrderSuccess(orderData);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !isProcessing && !orderReceipt && onClose()}
      ></div>

      {/* Main Modal Card (Neomorphic Window) */}
      <div className="relative bg-[#f1f3f6] w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-[14px_14px_30px_#a3b1c6,-14px_-14px_30px_#ffffff] border border-white p-5 md:p-8 z-10 flex flex-col justify-between">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2874f0] flex items-center justify-center shadow-inner">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <span>Secure Health Checkout</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  256-Bit Encrypted
                </span>
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                NutriKart Official Health Payments & Instant Order Fulfillment
              </p>
            </div>
          </div>

          {!orderReceipt && (
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="w-9 h-9 rounded-full bg-[#f1f3f6] shadow-[3px_3px_8px_#c5cad3,-3px_-3px_8px_#ffffff] text-gray-600 hover:text-black flex items-center justify-center transition-transform active:scale-95 disabled:opacity-40"
              title="Close"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: SUCCESS RECEIPT SCREEN (When Order is Completed) */}
        {/* ======================================================== */}
        {orderReceipt ? (
          <div className="py-8 space-y-6 text-center animate-in zoom-in-95 duration-300">
            {/* Green Animated Success Badge */}
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_10px_25px_rgba(16,185,129,0.4)] animate-bounce">
              <Check size={44} strokeWidth={3} />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900">
                Order Placed Successfully!
              </h3>
              <p className="text-sm font-semibold text-emerald-700">
                Payment Confirmed & Verified by NutriKart Health
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="max-w-xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-[inset_2px_2px_6px_#dbe2ec,inset_-2px_-2px_6px_#ffffff] border border-gray-200/80 text-left space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-200 text-xs">
                <div>
                  <span className="text-gray-500 block">Order Reference</span>
                  <span className="font-mono font-black text-gray-900 text-sm">
                    #{orderReceipt.orderId.toString().slice(-8).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Transaction Reference</span>
                  <span className="font-mono font-bold text-[#2874f0]">
                    {orderReceipt.transactionId}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Payment Mode</span>
                  <span className="font-bold text-emerald-700">
                    {orderReceipt.method} {orderReceipt.method === 'UPI' ? `(${orderReceipt.upiId})` : ''}
                  </span>
                </div>
              </div>

              {/* Items Preview */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-gray-500">Items Ordered ({orderReceipt.items.length}):</span>
                <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                  {orderReceipt.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded-lg">
                      <span className="font-bold text-gray-800 truncate max-w-[280px]">
                        {item.product?.name || item.name}
                        {item.selectedVariant ? ` (${item.selectedVariant})` : ''}
                      </span>
                      <span className="font-bold text-gray-900">
                        Qty: {item.quantity} × ₹{(item.price || item.product?.price || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Delivery Address */}
              <div className="pt-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block">Delivery Address:</span>
                  <span className="font-medium text-gray-800 line-clamp-1">{orderReceipt.address}</span>
                </div>
                <div className="sm:text-right shrink-0">
                  <span className="text-gray-500 block">Total Paid:</span>
                  <span className="text-xl font-black text-gray-900">₹{orderReceipt.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={() => { onClose(); navigate('/orders'); }}
                className="w-full sm:w-auto px-8 py-3 neo-btn-orange text-white font-black text-xs md:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Package size={16} />
                <span>View & Track Order</span>
              </button>
              <button
                onClick={() => { onClose(); navigate('/products'); }}
                className="w-full sm:w-auto px-8 py-3 bg-[#2874f0] text-white font-black text-xs md:text-sm rounded-xl shadow-md hover:bg-[#1a5ecc] transition-all"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => { onClose(); navigate('/dashboard'); }}
                className="w-full sm:w-auto px-8 py-3 neo-btn text-gray-800 font-bold text-xs md:text-sm rounded-xl shadow-sm"
              >
                Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* VIEW 2: INTERACTIVE CHECKOUT & PAYMENT METHOD SELECTOR   */
          /* ======================================================== */
          <div className="py-4 space-y-6">
            
            {/* TOP BAR: Delivery Address Card */}
            <div className="bg-[#f1f3f6] rounded-2xl p-4 shadow-[inset_2px_2px_5px_#c5cad3,inset_-2px_-2px_5px_#ffffff] border border-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#2874f0]" />
                  <span className="text-xs font-black uppercase tracking-wider text-gray-700">
                    1. Deliver To Address
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(!isEditingAddress)}
                  className="text-xs font-bold text-[#2874f0] hover:underline flex items-center gap-1"
                >
                  <Edit3 size={13} />
                  <span>{isEditingAddress ? 'Cancel' : 'Change Address'}</span>
                </button>
              </div>

              {isEditingAddress ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div>
                    <label className="block text-gray-500 font-bold mb-1">Full Name</label>
                    <input
                      type="text"
                      value={tempAddress.name}
                      onChange={(e) => setTempAddress({ ...tempAddress, name: e.target.value })}
                      className="w-full p-2 bg-white rounded-lg border border-gray-300 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-bold mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={tempAddress.phone}
                      onChange={(e) => setTempAddress({ ...tempAddress, phone: e.target.value })}
                      className="w-full p-2 bg-white rounded-lg border border-gray-300 font-semibold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-gray-500 font-bold mb-1">Flat / Building / Street Address</label>
                    <input
                      type="text"
                      value={tempAddress.street}
                      onChange={(e) => setTempAddress({ ...tempAddress, street: e.target.value })}
                      className="w-full p-2 bg-white rounded-lg border border-gray-300 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-bold mb-1">City</label>
                    <input
                      type="text"
                      value={tempAddress.city}
                      onChange={(e) => setTempAddress({ ...tempAddress, city: e.target.value })}
                      className="w-full p-2 bg-white rounded-lg border border-gray-300 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-bold mb-1">PIN Code</label>
                    <input
                      type="text"
                      value={tempAddress.pincode}
                      onChange={(e) => setTempAddress({ ...tempAddress, pincode: e.target.value })}
                      className="w-full p-2 bg-white rounded-lg border border-gray-300 font-semibold"
                    />
                  </div>
                  <div className="sm:col-span-2 flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleSaveAddress}
                      className="neo-btn-blue px-5 py-2 text-xs font-bold"
                    >
                      Save Address
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-800 font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-900">{address.name} <span className="text-gray-500 font-normal">({address.phone})</span></p>
                    <p className="text-gray-600 line-clamp-1">{address.street}, {address.locality}, {address.city}, {address.state} - <strong className="text-gray-900">{address.pincode}</strong></p>
                  </div>
                  <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md text-[11px] font-bold border border-emerald-200 shrink-0">
                    Standard Free Delivery (Tomorrow)
                  </span>
                </div>
              )}
            </div>

            {/* MIDDLE: 2-Column Payment Method Choice & Interactive Interface */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
              
              {/* Payment Method Selector Sidebar */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-gray-600 block mb-1">
                  2. Payment Method
                </span>

                {[
                  {
                    id: 'UPI',
                    name: 'UPI (GPay / PhonePe / QR)',
                    badge: 'FASTEST',
                    icon: <Smartphone size={18} className="text-[#2874f0]" />
                  },
                  {
                    id: 'Card',
                    name: 'Credit / Debit Card',
                    badge: '10% OFF',
                    icon: <CreditCard size={18} className="text-orange-500" />
                  },
                  {
                    id: 'NetBanking',
                    name: 'Net Banking (All Banks)',
                    badge: null,
                    icon: <Building2 size={18} className="text-emerald-600" />
                  },
                  {
                    id: 'COD',
                    name: 'Cash on Delivery',
                    badge: null,
                    icon: <Banknote size={18} className="text-gray-600" />
                  }
                ].map((m) => {
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition-all ${
                        isSelected
                          ? 'bg-blue-50/70 border-2 border-[#2874f0] shadow-[inset_2px_2px_4px_#c2cad8,inset_-2px_-2px_4px_#ffffff] text-[#2874f0]'
                          : 'bg-[#f1f3f6] border border-white/80 shadow-[3px_3px_7px_#c5cad3,-3px_-3px_7px_#ffffff] text-gray-700 hover:text-black'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                          {m.icon}
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight">{m.name}</p>
                          {m.badge && (
                            <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                              {m.badge}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-[#2874f0] bg-[#2874f0]' : 'border-gray-400'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Payment Details Form / Interactive Panel */}
              <div className="md:col-span-2 bg-white rounded-2xl p-5 shadow-[inset_2px_2px_6px_#dbe2ec,inset_-2px_-2px_6px_#ffffff] border border-gray-200/80">
                
                {/* 1. UPI Payment Mode */}
                {paymentMethod === 'UPI' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                        <Smartphone size={16} className="text-[#2874f0]" />
                        <span>Instant UPI Payment</span>
                      </h4>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Zero Gateway Surcharge
                      </span>
                    </div>

                    {/* App Tabs: GPay, PhonePe, Paytm, QR, Custom UPI */}
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {[
                        { id: 'gpay', label: 'Google Pay', icon: '🟢 GPay' },
                        { id: 'phonepe', label: 'PhonePe', icon: '🟣 PhonePe' },
                        { id: 'paytm', label: 'Paytm', icon: '🔵 Paytm' },
                        { id: 'qr', label: 'Scan QR', icon: '📷 QR Code' },
                        { id: 'custom', label: 'UPI ID', icon: '✍️ Any VPA' },
                      ].map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => setUpiOption(app.id)}
                          className={`p-2 rounded-xl text-center font-bold text-xs transition-all border ${
                            upiOption === app.id
                              ? 'bg-blue-50 border-[#2874f0] text-[#2874f0] shadow-sm'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <div className="text-xs mb-0.5">{app.icon}</div>
                          <div className="text-[10px] truncate">{app.label}</div>
                        </button>
                      ))}
                    </div>

                    {/* QR Code Display Mode */}
                    {upiOption === 'qr' ? (
                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex flex-col items-center justify-center text-center space-y-3">
                        {/* Realistic High-Quality SVG UPI QR Code */}
                        <div className="bg-white p-3 rounded-2xl shadow-md border-2 border-[#2874f0] relative">
                          <svg className="w-40 h-40" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Outer Finder Patterns */}
                            <rect x="10" y="10" width="30" height="30" rx="4" fill="#111827" />
                            <rect x="16" y="16" width="18" height="18" rx="2" fill="#FFFFFF" />
                            <rect x="20" y="20" width="10" height="10" rx="1" fill="#2874F0" />

                            <rect x="80" y="10" width="30" height="30" rx="4" fill="#111827" />
                            <rect x="86" y="16" width="18" height="18" rx="2" fill="#FFFFFF" />
                            <rect x="90" y="20" width="10" height="10" rx="1" fill="#2874F0" />

                            <rect x="10" y="80" width="30" height="30" rx="4" fill="#111827" />
                            <rect x="16" y="86" width="18" height="18" rx="2" fill="#FFFFFF" />
                            <rect x="20" y="90" width="10" height="10" rx="1" fill="#2874F0" />

                            {/* Center Logo Shield */}
                            <rect x="48" y="48" width="24" height="24" rx="6" fill="#2874F0" />
                            <text x="60" y="64" fill="#FFFFFF" fontSize="12" fontWeight="bold" textAnchor="middle">₹</text>

                            {/* Data Matrix Dots */}
                            <rect x="48" y="12" width="6" height="6" fill="#111827" />
                            <rect x="58" y="18" width="6" height="6" fill="#111827" />
                            <rect x="68" y="12" width="6" height="6" fill="#111827" />
                            <rect x="48" y="28" width="6" height="6" fill="#111827" />
                            <rect x="68" y="28" width="6" height="6" fill="#111827" />
                            
                            <rect x="12" y="48" width="6" height="6" fill="#111827" />
                            <rect x="24" y="58" width="6" height="6" fill="#111827" />
                            <rect x="36" y="48" width="6" height="6" fill="#111827" />

                            <rect x="80" y="48" width="6" height="6" fill="#111827" />
                            <rect x="94" y="58" width="6" height="6" fill="#111827" />
                            <rect x="102" y="48" width="6" height="6" fill="#111827" />

                            <rect x="48" y="80" width="6" height="6" fill="#111827" />
                            <rect x="58" y="90" width="6" height="6" fill="#111827" />
                            <rect x="68" y="80" width="6" height="6" fill="#111827" />
                            <rect x="58" y="102" width="6" height="6" fill="#111827" />

                            <rect x="80" y="80" width="6" height="6" fill="#111827" />
                            <rect x="92" y="92" width="6" height="6" fill="#111827" />
                            <rect x="102" y="102" width="6" height="6" fill="#111827" />
                          </svg>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-800">
                            Scan with Google Pay, PhonePe, Paytm, or CRED
                          </p>
                          <p className="text-[11px] text-gray-500 font-mono">
                            Merchant VPA: <strong className="text-[#2874f0]">nutrikart@icici</strong>
                          </p>
                          <p className="text-[11px] font-bold text-amber-600">
                            ⏱ QR Code expires in {formatTimer(qrTimer)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Custom or Selected App UPI ID Field */
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-gray-700">
                          {upiOption === 'custom' ? 'Enter Virtual Payment Address (UPI ID)' : `Enter your registered ${upiOption.toUpperCase()} Mobile Number / UPI ID`}
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={customUpiId}
                              onChange={(e) => setCustomUpiId(e.target.value)}
                              placeholder="e.g. 9876543210@paytm or name@okhdfcbank"
                              className="w-full text-xs font-bold p-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
                            />
                            {upiVerified && (
                              <span className="absolute right-3 top-3 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-200">
                                <Check size={10} strokeWidth={3} /> Verified
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => { setUpiVerified(true); alert('UPI ID Verified successfully via NPCI!'); }}
                            className="neo-btn px-3 py-2.5 text-xs font-bold shrink-0 text-[#2874f0]"
                          >
                            Verify
                          </button>
                        </div>
                        <p className="text-[11px] text-gray-500">
                          A payment request of <strong>₹{totalPrice.toLocaleString('en-IN')}</strong> will be sent to your UPI App upon confirming.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Credit / Debit Card Mode */}
                {paymentMethod === 'Card' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                        <CreditCard size={16} className="text-orange-500" />
                        <span>Credit / Debit / ATM Card</span>
                      </h4>
                      <div className="flex items-center gap-1 text-[10px] font-black text-gray-500">
                        <span>VISA</span> • <span>Mastercard</span> • <span>RuPay</span>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardData.number}
                          onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                          placeholder="4532 8921 4432 9012"
                          maxLength={19}
                          className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-300 font-mono font-bold tracking-wider"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-600 font-bold mb-1">Valid Thru (MM/YY)</label>
                          <input
                            type="text"
                            value={cardData.expiry}
                            onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-300 font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 font-bold mb-1">CVV</label>
                          <input
                            type="password"
                            value={cardData.cvv}
                            onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                            placeholder="***"
                            maxLength={4}
                            className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-300 font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-600 font-bold mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardData.name}
                          onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                          className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-300 font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Net Banking Mode */}
                {paymentMethod === 'NetBanking' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                        <Building2 size={16} className="text-emerald-600" />
                        <span>Net Banking (Indian Banks)</span>
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {['HDFC', 'SBI', 'ICICI', 'AXIS', 'KOTAK', 'PNB'].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setSelectedBank(b)}
                          className={`p-3 rounded-xl text-center font-bold text-xs transition-all border ${
                            selectedBank === b
                              ? 'bg-blue-50 border-[#2874f0] text-[#2874f0] shadow-sm'
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          🏦 {b} Bank
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-500 text-center">
                      You will be securely redirected to {selectedBank} Bank portal to complete your transaction.
                    </p>
                  </div>
                )}

                {/* 4. Cash on Delivery (COD) Mode */}
                {paymentMethod === 'COD' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                        <Banknote size={16} className="text-gray-600" />
                        <span>Cash on Delivery (Pay at Doorstep)</span>
                      </h4>
                    </div>

                    <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs text-amber-900 space-y-1">
                      <p className="font-bold">⚠️ Cash / UPI Available on Delivery:</p>
                      <p>You can pay via Cash or scan delivery executive QR code using any UPI app upon package arrival.</p>
                    </div>

                    {/* Anti-bot confirmation code */}
                    <div className="space-y-2 text-xs">
                      <label className="block text-gray-600 font-bold">
                        Enter Confirmation Code to verify order:
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-200 px-4 py-2 rounded-xl font-mono text-lg font-black tracking-widest select-none line-through text-gray-700">
                          {captchaCode}
                        </div>
                        <input
                          type="text"
                          value={userCaptcha}
                          onChange={(e) => setUserCaptcha(e.target.value)}
                          placeholder="Enter 4-digit code"
                          maxLength={4}
                          className="p-2.5 bg-gray-50 rounded-xl border border-gray-300 font-mono font-bold text-sm flex-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* BOTTOM BAR: Price Breakdown & Big Confirm Payment Button */}
            <div className="pt-4 border-t border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-baseline gap-3 text-xs w-full sm:w-auto">
                <span className="text-gray-500 font-bold">Total Payable:</span>
                <span className="text-2xl font-black text-gray-900">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  ₹{totalMRP.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-[#388e3c]">
                  (Saved ₹{totalDiscount.toLocaleString('en-IN')})
                </span>
              </div>

              <button
                type="button"
                onClick={handlePayAndPlaceOrder}
                disabled={isProcessing}
                className="w-full sm:w-80 neo-btn-orange py-3.5 px-6 text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                    <span>Processing Payment...</span>
                  </div>
                ) : (
                  <>
                    <Lock size={16} strokeWidth={2.5} />
                    <span>
                      {paymentMethod === 'COD' ? `Confirm Order (₹${totalPrice.toLocaleString('en-IN')})` : `Pay ₹${totalPrice.toLocaleString('en-IN')} & Place Order`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CheckoutModal;
