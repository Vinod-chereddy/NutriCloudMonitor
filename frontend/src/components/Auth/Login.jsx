import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { authAPI, adminAuthAPI } from '../../services/api';
import { AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  const userAuth = useAuth();
  const adminAuth = useAdminAuth();
  const navigate = useNavigate();

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 5000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      showToast('Please enter a valid email address');
      return;
    }

    if (!password.trim()) {
      showToast('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      try {
        const response = await authAPI.login({
          email: normalizedEmail,
          password
        });
        userAuth.login(response.data.user, response.data.token);
        navigate('/dashboard');
      } catch (userError) {
        if (
          userError.response?.status === 401 ||
          userError.response?.status === 404 ||
          userError.response?.status === 400
        ) {
          const adminResponse = await adminAuthAPI.login({
            email: normalizedEmail,
            password
          });
          adminAuth.login(adminResponse.data.admin, adminResponse.data.token);
          navigate('/admin/dashboard');
        } else {
          throw userError;
        }
      }
    } catch (error) {
      showToast(
        'Authentication Failed: ' +
          (error.response?.data?.message || 'Invalid Credentials')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFillAdmin = () => {
    setEmail('admin@healthcart.com');
    setPassword('admin123');
  };

  const handleFillUser = () => {
    setEmail('user@healthcart.com');
    setPassword('user123');
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col justify-center items-center p-4 font-sans selection:bg-[#2874f0] selection:text-white">
      
      {/* Top NutriKart Brand Logo */}
      <div 
        onClick={() => navigate('/login')}
        className="mb-6 flex flex-col items-center cursor-pointer group select-none"
      >
        <span className="text-3xl font-black italic tracking-tight text-[#2874f0] group-hover:scale-105 transition-transform">
          Nutri<span className="text-[#ffe500] drop-shadow-sm">Kart</span>
        </span>
        <span className="text-[11px] font-bold italic text-gray-500 -mt-1">
          Explore <span className="text-[#ffe500] font-black">Plus ✦</span>
        </span>
      </div>

      {/* Classic NutriKart Dual-Panel Modal Card (Neomorphic Soft Container) */}
      <div className="w-full max-w-3xl bg-[#f1f3f6] rounded-3xl shadow-[12px_12px_28px_#c5cad3,-12px_-12px_28px_#ffffff] border border-white/90 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        
        {/* Left NutriKart Blue Banner */}
        <div className="md:w-2/5 bg-[#2874f0] text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4 relative z-10">
            <h2 className="text-3xl font-black tracking-tight leading-tight">
              Login
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed font-medium">
              Get access to your Orders, Wishlist, Diet Plans and Health Recommendations.
            </p>
          </div>

          {/* NutriKart Shopping Illustration Graphic */}
          <div className="relative z-10 pt-12 pb-4 text-center">
            <div className="w-28 h-28 mx-auto rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-5xl shadow-xl">
              🛍️
            </div>
            <p className="text-xs font-bold text-blue-200 mt-4 tracking-wider uppercase">
              100% Secure Health Gateway
            </p>
          </div>

          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full pointer-events-none"></div>
        </div>

        {/* Right Neomorphic Form Panel */}
        <div className="md:w-3/5 p-8 md:p-10 flex flex-col justify-between space-y-6">
          {/* Tab Switcher: Login / Create Account */}
          <div className="flex border-b border-gray-200/80 mb-1">
            <button
              type="button"
              className="flex-1 pb-3 font-black text-sm text-[#2874f0] border-b-2 border-[#2874f0] tracking-wide"
            >
              🔑 Login
            </button>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="flex-1 pb-3 font-bold text-sm text-gray-500 hover:text-gray-900 tracking-wide transition-colors"
            >
              ✍️ Sign Up (New User)
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                Enter Email / Mobile Number
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#f1f3f6] text-[#212121] rounded-xl px-4 py-3 text-sm font-semibold shadow-[inset_3px_3px_6px_#c5cad3,inset_-3px_-3px_6px_#ffffff] border border-white/80 focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                Enter Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-[#f1f3f6] text-[#212121] rounded-xl px-4 py-3 text-sm font-semibold shadow-[inset_3px_3px_6px_#c5cad3,inset_-3px_-3px_6px_#ffffff] border border-white/80 focus:outline-none focus:ring-2 focus:ring-[#2874f0] pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 leading-relaxed">
              By continuing, you agree to NutriKart's{' '}
              <a href="#" className="text-[#2874f0] font-bold hover:underline">Terms of Use</a> and{' '}
              <a href="#" className="text-[#2874f0] font-bold hover:underline">Privacy Policy</a>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full neo-btn-orange py-3.5 text-xs md:text-sm font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          {/* New to NutriKart link */}
          <div className="text-center pt-2">
            <button
              onClick={() => navigate('/signup')}
              className="text-[#2874f0] font-bold text-xs md:text-sm hover:underline"
            >
              New to NutriKart? Create an account
            </button>
          </div>

          {/* Quick Demo Access Credentials Box (Neomorphic Inset Panel) */}
          <div className="bg-[#f1f3f6] rounded-2xl p-4 shadow-[inset_2px_2px_5px_#c5cad3,inset_-2px_-2px_5px_#ffffff] border border-white/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-gray-700 flex items-center gap-1.5">
                <Shield size={13} className="text-[#2874f0]" /> Demo Access Credentials
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleFillAdmin}
                  className="text-[10px] font-black bg-[#2874f0] text-white px-2 py-0.5 rounded shadow-sm hover:bg-[#1a5ecc]"
                >
                  Autofill Admin
                </button>
                <button
                  type="button"
                  onClick={handleFillUser}
                  className="text-[10px] font-black bg-gray-700 text-white px-2 py-0.5 rounded shadow-sm hover:bg-gray-800"
                >
                  Autofill User
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/60 p-2 rounded-lg">
                <p className="font-bold text-[#2874f0] text-[10px]">Admin SOC:</p>
                <p className="text-gray-800 font-mono text-[11px]">admin@healthcart.com</p>
                <p className="text-gray-500 font-mono text-[11px]">admin123</p>
              </div>
              <div className="bg-white/60 p-2 rounded-lg">
                <p className="font-bold text-emerald-600 text-[10px]">Standard User:</p>
                <p className="text-gray-800 font-mono text-[11px]">user@healthcart.com</p>
                <p className="text-gray-500 font-mono text-[11px]">user123</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 bg-[#212121] text-white px-5 py-3 rounded-xl shadow-2xl z-[200] flex items-center gap-3 border border-gray-700">
          <AlertCircle className="text-[#fb641b]" size={20} />
          <span className="font-bold text-xs">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default Login;
