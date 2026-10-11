import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { AlertCircle, Eye, EyeOff, User, Mail, Lock, ShieldCheck } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  const { login } = useAuth();
  const navigate = useNavigate();

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 5000);
  };

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
  };

  const getPasswordStrength = (password) => {
    const value = String(password || '');
    let score = 0;

    if (value.length >= 8) score++;
    if (/[a-z]/.test(value)) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    if (!value) {
      return { score: 0, label: '', color: 'transparent', width: '0%' };
    }
    if (score <= 2) {
      return { score, label: 'Weak', color: '#ef4444', width: '33%' };
    }
    if (score <= 4) {
      return { score, label: 'Medium', color: '#f59e0b', width: '66%' };
    }
    return { score, label: 'Strong', color: '#22c55e', width: '100%' };
  };

  const passwordStrength = useMemo(
    () => getPasswordStrength(formData.password),
    [formData.password]
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedEmail = formData.email.trim().toLowerCase();

    if (!formData.name.trim()) {
      showToast('Please enter your full name');
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      showToast('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        name: formData.name.trim(),
        email: normalizedEmail,
        password: formData.password
      });

      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col justify-center items-center p-4 font-sans selection:bg-[#2874f0] selection:text-white">
      
      {/* Top NutriKart Brand Logo */}
      <div 
        onClick={() => navigate('/dashboard')}
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
      <div className="w-full max-w-3xl bg-[#f1f3f6] rounded-3xl shadow-[12px_12px_28px_#c5cad3,-12px_-12px_28px_#ffffff] border border-white/90 overflow-hidden flex flex-col md:flex-row min-h-[550px]">
        
        {/* Left NutriKart Blue Banner */}
        <div className="md:w-2/5 bg-[#2874f0] text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4 relative z-10">
            <h2 className="text-3xl font-black tracking-tight leading-tight">
              Looks like you're new here!
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed font-medium">
              Sign up with your details to access customized nutrition plans, BMI telemetry, and exclusive NutriKart SuperCoin benefits.
            </p>
          </div>

          <div className="relative z-10 pt-10 pb-4 text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-4xl shadow-xl">
              ✨
            </div>
            <p className="text-xs font-bold text-blue-200 mt-4 tracking-wider uppercase">
              Join 500,000+ Health Members
            </p>
          </div>

          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full pointer-events-none"></div>
        </div>

        {/* Right Neomorphic Form Panel */}
        <div className="md:w-3/5 p-8 md:p-10 flex flex-col justify-between space-y-5">
          {/* Tab Switcher: Login / Create Account */}
          <div className="flex border-b border-gray-200/80 mb-1">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex-1 pb-3 font-bold text-sm text-gray-500 hover:text-gray-900 tracking-wide transition-colors"
            >
              🔑 Login
            </button>
            <button
              type="button"
              className="flex-1 pb-3 font-black text-sm text-[#2874f0] border-b-2 border-[#2874f0] tracking-wide"
            >
              ✍️ Sign Up (New User)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-[#f1f3f6] text-[#212121] rounded-xl px-4 py-2.5 text-sm font-semibold shadow-[inset_3px_3px_6px_#c5cad3,inset_-3px_-3px_6px_#ffffff] border border-white/80 focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full bg-[#f1f3f6] text-[#212121] rounded-xl px-4 py-2.5 text-sm font-semibold shadow-[inset_3px_3px_6px_#c5cad3,inset_-3px_-3px_6px_#ffffff] border border-white/80 focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">
                Set Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="w-full bg-[#f1f3f6] text-[#212121] rounded-xl px-4 py-2.5 text-sm font-semibold shadow-[inset_3px_3px_6px_#c5cad3,inset_-3px_-3px_6px_#ffffff] border border-white/80 focus:outline-none focus:ring-2 focus:ring-[#2874f0] pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {formData.password && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-300 rounded-full"
                      style={{ width: passwordStrength.width, backgroundColor: passwordStrength.color }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="w-full bg-[#f1f3f6] text-[#212121] rounded-xl px-4 py-2.5 text-sm font-semibold shadow-[inset_3px_3px_6px_#c5cad3,inset_-3px_-3px_6px_#ffffff] border border-white/80 focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
                required
              />
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
                <span>CONTINUE & CREATE ACCOUNT</span>
              )}
            </button>
          </form>

          {/* Existing user button */}
          <div className="pt-2">
            <button
              onClick={() => navigate('/login')}
              className="w-full neo-btn py-3 text-xs md:text-sm font-bold text-[#2874f0] hover:text-[#1a5ecc] transition-colors"
            >
              Existing User? Log in
            </button>
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

export default Signup;

