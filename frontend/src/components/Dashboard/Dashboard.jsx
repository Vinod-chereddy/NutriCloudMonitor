import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userAPI, productAPI, regimenAPI, cartAPI, ASSET_URL } from '../../services/api';
import { 
  ShieldCheck, Activity, Award, ShoppingCart, Zap, CheckCircle2, 
  Clock, ArrowRight, UserCheck, Heart, AlertCircle, Check, Star
} from 'lucide-react';
import NutriNavbar from '../Common/NutriNavbar';
import NutriFooter from '../Common/NutriFooter';
import ManageProfileModal from './ManageProfileModal';
import { resolveProductImage, getCategoryFallback } from '../../utils/imageHelper';

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-[#212121] font-sans flex flex-col selection:bg-[#2874f0] selection:text-white">
      {/* NutriKart Brand Navigation Header */}
      <NutriNavbar />

      {/* Main NutriKart Health Dashboard Body */}
      <main className="max-w-7xl w-full mx-auto px-3 md:px-6 py-5 flex-1 space-y-6">
        
        {/* NutriKart Plus Member Banner (Neomorphic Soft Card) */}
        <div className="bg-[#f1f3f6] rounded-3xl p-5 md:p-8 shadow-[8px_8px_20px_#d1d9e6,-8px_-8px_20px_#ffffff] border border-white/80 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-3 z-10 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-[#ffe500] text-[#2874f0] font-black text-xs px-3 py-1 rounded-full shadow-sm">
                <Award size={14} className="fill-[#2874f0]" /> NUTRIKART HEALTH PLUS MEMBER
              </span>
              <span className="fk-assured-badge">
                <span>✦</span> Assured
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              Welcome back, <span className="text-[#2874f0]">{user?.name || 'Valued Member'}</span>!
            </h1>

            <p className="text-gray-600 text-xs md:text-sm max-w-2xl leading-relaxed font-medium">
              Your personalized AI Health & Nutrition dashboard is synchronized with your biological metrics. Browse curated supplements, follow your shift diet, and monitor real-time health telemetry.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => document.getElementById('bmi-calculator-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="neo-btn-blue px-5 py-2.5 text-xs font-bold flex items-center gap-2"
              >
                <Activity size={15} />
                <span>Health Station & BMI</span>
              </button>

              <button
                onClick={() => navigate('/products')}
                className="neo-btn-yellow px-5 py-2.5 text-xs font-bold flex items-center gap-2"
              >
                <ShoppingCart size={15} />
                <span>Explore Nutrition Store</span>
              </button>

              <button
                onClick={() => setShowProfileModal(true)}
                className="neo-btn px-4 py-2.5 text-xs font-bold text-gray-700 hover:text-black flex items-center gap-1.5"
              >
                <UserCheck size={15} />
                <span>Account Info</span>
              </button>
            </div>
          </div>

          {/* NutriKart SuperCoin Balance & BMI Status Emblem */}
          <div className="flex items-center gap-4 z-10 flex-shrink-0">
            {/* SuperCoin Widget */}
            <div className="bg-[#f1f3f6] p-4 rounded-2xl shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] text-center w-36 border border-white/60">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#ffe500] flex items-center justify-center text-[#2874f0] font-black text-lg shadow-md mb-2">
                🪙
              </div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">SuperCoins</p>
              <p className="text-xl font-black text-gray-900">250</p>
              <p className="text-[10px] text-emerald-600 font-bold">5% Extra Discount</p>
            </div>

            {/* Health Score Pill */}
            <div className="bg-[#f1f3f6] p-4 rounded-2xl shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] text-center w-36 border border-white/60">
              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500 flex items-center justify-center text-white font-black text-lg shadow-md mb-2">
                {user?.bmiCategory === 'Normal' ? 'A+' : user?.bmiCategory ? 'B' : '✓'}
              </div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">BMI Status</p>
              <p className="text-sm font-black text-gray-900 truncate">{user?.bmiCategory || 'Setup BMI'}</p>
              <p className="text-[10px] text-[#2874f0] font-bold">Optimal Plan</p>
            </div>
          </div>
        </div>

        {/* Interactive Neomorphic BMI Health Station */}
        <section id="bmi-calculator-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2">
              <Activity className="text-[#2874f0]" size={24} />
              NutriKart Health Station: Biometric Health Calculator
            </h2>
            <span className="text-xs text-gray-500 font-semibold hidden sm:inline">
              Instant AI Diet Recommendations
            </span>
          </div>

          <BMICalculator user={user} updateUser={updateUser} setToast={setToast} />
        </section>

        {/* NutriKart Deals of the Day / BMI Matched Products */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2">
                <Zap className="text-[#fb641b]" size={24} />
                Deals of the Day: Personalized for {user?.name || 'You'}
              </h2>
              <span className="bg-red-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full animate-pulse">
                HOT DEALS
              </span>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="text-xs font-bold text-[#2874f0] hover:underline flex items-center gap-1"
            >
              <span>VIEW ALL</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <DietPlan user={user} setToast={setToast} />
        </section>

        {/* Daily Shift Regimen Plan */}
        <section className="space-y-4 pt-2 pb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2">
              <Clock className="text-[#388e3c]" size={24} />
              Shift-Wise Nutrition & Supplement Routine
            </h2>
            <span className="text-xs text-gray-500 font-semibold">
              Daily Action Checklist
            </span>
          </div>

          <ShiftProductsPlan user={user} setToast={setToast} />
        </section>

      </main>

      {/* Profile Settings Modal */}
      {showProfileModal && (
        <ManageProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          onUpdate={(updated) => updateUser(updated)}
        />
      )}

      {/* Floating NutriKart Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 bg-[#212121] text-white px-5 py-3 rounded-xl shadow-[8px_8px_20px_rgba(0,0,0,0.3)] z-[200] animate-in slide-in-from-bottom-5 fade-in duration-300 flex items-center gap-3 border border-gray-700">
          {toast.type === 'error' ? (
            <AlertCircle className="text-[#fb641b]" size={20} />
          ) : (
            <Check className="text-[#ffe500]" size={20} strokeWidth={3} />
          )}
          <span className="font-bold text-xs md:text-sm">{toast.message}</span>
        </div>
      )}

      {/* NutriKart Brand Footer */}
      <NutriFooter />
    </div>
  );
};

/* ========================================================
   NEOMORPHIC BMI CALCULATOR COMPONENT
   ======================================================== */
const BMICalculator = ({ user, updateUser, setToast }) => {
  const [height, setHeight] = useState(user?.height || '');
  const [weight, setWeight] = useState(user?.weight || '');
  const [loading, setLoading] = useState(false);

  const handleCalculate = async (e) => {
    e.preventDefault();
    if (!height || !weight) {
      setToast({ show: true, message: 'Please enter both height and weight', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 4000);
      return;
    }

    setLoading(true);
    try {
      const response = await userAPI.calculateBMI({ 
        height: parseInt(height), 
        weight: parseInt(weight) 
      });
      updateUser(response.data.user);
      setToast({ 
        show: true, 
        message: `BMI updated to ${response.data.user.bmi} (${response.data.user.bmiCategory})!`, 
        type: 'success' 
      });
      setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    } catch (error) {
      setToast({ 
        show: true, 
        message: 'Error calculating BMI: ' + (error.response?.data?.message || 'Server error'), 
        type: 'error' 
      });
      setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f1f3f6] rounded-3xl p-6 md:p-8 shadow-[8px_8px_20px_#d1d9e6,-8px_-8px_20px_#ffffff] border border-white/80">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        
        {/* Form Inputs (Sunken Neomorphic Inset) */}
        <form onSubmit={handleCalculate} className="lg:col-span-2 space-y-4">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            Enter body metrics to synchronize customized diet & supplement catalog:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 175"
                min="50"
                max="250"
                className="w-full bg-[#f1f3f6] text-[#212121] rounded-2xl px-4 py-3 text-base font-bold shadow-[inset_3px_3px_6px_#c5cad3,inset_-3px_-3px_6px_#ffffff] border border-white/70 focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 70"
                min="20"
                max="300"
                className="w-full bg-[#f1f3f6] text-[#212121] rounded-2xl px-4 py-3 text-base font-bold shadow-[inset_3px_3px_6px_#c5cad3,inset_-3px_-3px_6px_#ffffff] border border-white/70 focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
                required
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="neo-btn-blue px-8 py-3 text-xs md:text-sm font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Activity size={16} />
                  <span>CALCULATE BMI & SYNC DIET</span>
                </>
              )}
            </button>
            <span className="text-xs text-gray-500 font-medium">
              ⚡ Instant dietary re-calibration for your optimal wellness goals
            </span>
          </div>
        </form>

        {/* Live Visual Gauge / BMI Result Card */}
        <div className="bg-[#f1f3f6] rounded-2xl p-6 shadow-[inset_3px_3px_8px_#d1d9e6,inset_-3px_-3px_8px_#ffffff] border border-white/60 text-center space-y-3">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Your BMI Score
          </span>

          <div className="flex items-baseline justify-center gap-2">
            <span className="text-5xl font-black text-gray-900 tracking-tight">
              {user?.bmi || '--'}
            </span>
            <span className="text-sm font-bold text-gray-500">kg/m²</span>
          </div>

          {user?.bmiCategory ? (
            <div className="space-y-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm ${
                user.bmiCategory === 'Normal' ? 'bg-emerald-500 text-white' :
                user.bmiCategory === 'Underweight' ? 'bg-blue-500 text-white' :
                user.bmiCategory === 'Overweight' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {user.bmiCategory}
              </span>

              {/* Progress gauge bar */}
              <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden shadow-inner flex">
                <div className="w-1/4 bg-blue-400" title="Underweight (< 18.5)"></div>
                <div className="w-1/4 bg-emerald-500" title="Normal (18.5 - 24.9)"></div>
                <div className="w-1/4 bg-amber-500" title="Overweight (25 - 29.9)"></div>
                <div className="w-1/4 bg-red-500" title="Obese (>= 30)"></div>
              </div>

              <p className="text-[11px] text-gray-500 font-semibold pt-1">
                Recommendation Match: <strong className="text-emerald-600">100% Tailored</strong>
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-400 font-medium">Enter your height and weight to calculate your BMI rating</p>
          )}
        </div>

      </div>
    </div>
  );
};

/* ========================================================
   DIET & PRODUCT RECOMMENDATION COMPONENT
   ======================================================== */
const DietPlan = ({ user, setToast }) => {
  const [dietPlan, setDietPlan] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDietPlan();
    fetchProducts();
  }, [user?.bmiCategory]);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAllProducts({ limit: 20 });
      setProducts(response.data?.products || []);
    } catch (e) {
      console.warn('Failed fetching products');
    }
  };

  const fetchDietPlan = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getDietRecommendations();
      setDietPlan(response.data?.dietPlan || []);
    } catch (error) {
      // Fallback diet recommendations
      setDietPlan([
        { id: 1, food: "Whey Protein & Oats Bowl", benefits: "Fast muscle synthesis & sustained slow carbohydrates.", quantity: "1 bowl", calories: 350 },
        { id: 2, food: "Grilled Herb Chicken & Quinoa", benefits: "High lean protein mix for midday metabolic focus.", quantity: "1 plate", calories: 420 },
        { id: 3, food: "Wild Salmon & Steamed Broccoli", benefits: "Rich Omega-3 fatty acids for joint and heart recovery.", quantity: "1 plate", calories: 450 },
        { id: 4, food: "Micellar Casein & Roasted Almonds", benefits: "Sustained slow-release amino acids for overnight repair.", quantity: "1 bowl", calories: 260 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await cartAPI.addToCart({ productId: product._id, quantity: 1 });
      setToast({ show: true, message: `Added ${product.name} to cart!`, type: 'success' });
      setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    } catch (err) {
      setToast({ show: true, message: 'Failed to add item', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 4000);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-[#2874f0] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Filter products by BMI category
  let recommended = products.filter(p => p.recommendedFor && p.recommendedFor.includes(user?.bmiCategory));
  if (recommended.length === 0) recommended = products.slice(0, 4);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {recommended.map((prod, idx) => {
        const mealMatch = dietPlan[idx % dietPlan.length];
        const originalPrice = Math.round(prod.price * 1.45);
        const discount = Math.round(((originalPrice - prod.price) / originalPrice) * 100);

        return (
          <div
            key={prod._id || idx}
            className="bg-[#f1f3f6] rounded-2xl p-4 shadow-[6px_6px_14px_#d1d9e6,-6px_-6px_14px_#ffffff] border border-white/80 flex flex-col justify-between hover:shadow-[9px_9px_18px_#c2cad8,-9px_-9px_18px_#ffffff] transition-all group"
          >
            <div>
              {/* Product Image Frame */}
              <div className="w-full aspect-square bg-white rounded-xl p-3 shadow-[inset_2px_2px_5px_#e0e6ed,inset_-2px_-2px_5px_#ffffff] flex items-center justify-center mb-3 overflow-hidden">
                <img
                  src={resolveProductImage(prod.image, prod.category)}
                  alt={prod.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getCategoryFallback(prod.category);
                  }}
                />
              </div>

              {/* Deal Tag & Category */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2874f0]">
                  {prod.category}
                </span>
                <span className="fk-assured-badge">
                  <span>✦</span> Assured
                </span>
              </div>

              <h4 className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-[#2874f0] transition-colors">
                {prod.name}
              </h4>

              {/* Meal Association */}
              {mealMatch && (
                <div className="mt-1.5 bg-blue-50/70 border border-blue-200/50 rounded-lg p-1.5 text-[11px] text-gray-700">
                  <p className="font-bold text-[#2874f0] truncate">{mealMatch.food}</p>
                  <p className="text-gray-500 text-[10px] line-clamp-1">{mealMatch.benefits}</p>
                </div>
              )}

              {/* NutriKart Pricing */}
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-base font-black text-gray-900">
                  ₹{prod.price?.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-[#388e3c]">
                  {discount}% off
                </span>
              </div>
            </div>

            {/* Action */}
            <div className="mt-3 pt-2 border-t border-gray-200/60">
              <button
                onClick={() => handleAddToCart(prod)}
                className="w-full neo-btn-yellow py-2 text-xs font-black uppercase flex items-center justify-center gap-1.5 shadow-sm"
              >
                <ShoppingCart size={13} strokeWidth={2.5} />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ========================================================
   SHIFT-WISE NUTRITION ROUTINE COMPONENT
   ======================================================== */
const ShiftProductsPlan = ({ user, setToast }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedShifts, setCompletedShifts] = useState({});

  useEffect(() => {
    fetchProducts();
    if (user) {
      fetchRegimen();
    }
  }, [user]);

  const fetchRegimen = async () => {
    try {
      const response = await regimenAPI.getToday();
      const shiftsMap = {};
      response.data?.regimens?.forEach(r => {
        if (r.isCompleted) shiftsMap[r.shiftId] = true;
      });
      setCompletedShifts(shiftsMap);
    } catch (error) {
      console.warn('Could not fetch daily regimen state');
    }
  };

  const handleMarkComplete = async (shiftId) => {
    try {
      setCompletedShifts(prev => ({ ...prev, [shiftId]: true }));
      await regimenAPI.markComplete(shiftId);
      setToast({ show: true, message: 'Shift marked as completed!', type: 'success' });
      setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    } catch (error) {
      setCompletedShifts(prev => ({ ...prev, [shiftId]: false }));
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAllProducts({ limit: 12 });
      setProducts(response.data?.products || []);
    } catch (error) {
      console.warn('Could not fetch regimen products');
    } finally {
      setLoading(false);
    }
  };

  const shifts = [
    { id: 'shift_0', title: 'Morning Kickstart', time: '07:00 AM', category: 'Protein', desc: 'Accelerate muscular recovery & ignite metabolic focus.' },
    { id: 'shift_1', title: 'Midday Stamina', time: '01:00 PM', category: 'Equipment', desc: 'Active resistance stimulation and postural alignment.' },
    { id: 'shift_2', title: 'Evening Recovery', time: '07:00 PM', category: 'Snacks', desc: 'Replenish glycogen stores with guilt-free protein treats.' },
    { id: 'shift_3', title: 'Night Deep Repair', time: '10:30 PM', category: 'Protein', desc: 'Micellar casein slow-release protein synthesis.' }
  ];

  if (loading) {
    return (
      <div className="py-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-[#2874f0] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {shifts.map((shift, i) => {
        const isCompleted = completedShifts[shift.id];
        const prod = products.find(p => p.category === shift.category) || products[i % products.length];

        return (
          <div
            key={shift.id}
            className={`bg-[#f1f3f6] rounded-2xl p-5 shadow-[6px_6px_14px_#d1d9e6,-6px_-6px_14px_#ffffff] border border-white/80 flex flex-col justify-between transition-all ${
              isCompleted ? 'opacity-70 bg-emerald-50/50' : 'hover:-translate-y-1'
            }`}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#2874f0]">
                  Shift {i + 1}
                </span>
                <span className="text-[10px] font-bold text-gray-500 bg-white/80 px-2 py-0.5 rounded-full shadow-inner">
                  {shift.time}
                </span>
              </div>

              <h4 className={`text-base font-black ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                {shift.title}
              </h4>
              <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">
                {shift.desc}
              </p>

              {/* Product Match */}
              {prod && (
                <div className="mt-3 bg-white p-2.5 rounded-xl shadow-inner flex items-center gap-3 border border-gray-100">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg p-1 shrink-0 flex items-center justify-center">
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
                  <div className="truncate">
                    <p className="text-xs font-bold text-gray-800 truncate">{prod.name}</p>
                    <p className="text-[11px] font-black text-[#388e3c]">₹{prod.price}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Checkmark Button */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <button
                onClick={() => !isCompleted && handleMarkComplete(shift.id)}
                disabled={isCompleted}
                className={`w-full py-2 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 transition-all ${
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-800 shadow-inner cursor-default'
                    : 'neo-btn text-gray-800 hover:text-[#2874f0]'
                }`}
              >
                <CheckCircle2 size={15} className={isCompleted ? 'text-emerald-600 fill-emerald-100' : 'text-gray-400'} />
                <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Dashboard;

