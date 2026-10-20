import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminAuthAPI } from '../../services/api';
import { Shield, Lock, Eye, EyeOff, AlertTriangle, ArrowLeft, KeyRound, Terminal } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const adminAuth = useAdminAuth();
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide admin credentials');
      return;
    }

    setLoading(true);

    try {
      const response = await adminAuthAPI.login({
        email: email.trim().toLowerCase(),
        password
      });

      if (response.data?.token) {
        adminAuth.login(response.data.admin, response.data.token);
        navigate('/admin/dashboard');
      } else {
        setError('Authentication response did not contain an authorization token');
      }
    } catch (err) {
      console.error('Admin authentication failure:', err);
      setError(
        err.response?.data?.message || 'Access Denied: Invalid Security Analyst Credentials'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAutofill = () => {
    setEmail('admin@healthcart.com');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#07111f] flex flex-col justify-center items-center p-4 font-mono text-slate-200 selection:bg-cyan-500 selection:text-slate-900 relative overflow-hidden">
      
      {/* Background Cyber Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Back Navigation */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between z-10">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Storefront
        </Link>
        <span className="text-[10px] uppercase tracking-widest text-cyan-500/80 border border-cyan-500/30 px-2 py-0.5 rounded">
          SOC Tier-3 Clearance
        </span>
      </div>

      {/* Admin Login Card */}
      <div className="w-full max-w-md bg-[#0b192e] border border-cyan-500/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative z-10 backdrop-blur-xl">
        
        {/* Terminal Header Icon */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-wide flex items-center gap-2">
              SOC Command Center
            </h1>
            <p className="text-[11px] text-slate-400">
              Security Analyst Authentication Required
            </p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="mb-6 p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-start gap-2.5 text-xs text-cyan-200">
          <Terminal size={16} className="text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            This console provides live behavioral telemetry, forensic clickstream analysis, and risk mitigation tools.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 flex items-center gap-2 text-xs text-rose-300">
            <AlertTriangle size={16} className="shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
              Admin Identity / Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@healthcart.com"
                className="w-full bg-[#07111f] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-sans"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
              Passcode
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#07111f] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-sans pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <KeyRound size={15} />
                <span>Verify Admin Clearance</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between text-xs">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Demo Admin Credentials</p>
            <p className="text-[11px] text-slate-300 font-sans">admin@healthcart.com / admin123</p>
          </div>
          <button
            type="button"
            onClick={handleAutofill}
            className="px-2.5 py-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded-lg transition-colors"
          >
            Autofill
          </button>
        </div>

      </div>

      {/* Footer Info */}
      <p className="text-[11px] text-slate-600 mt-6 z-10">
        NutriCloud Behavioral Threat Telemetry & Risk Mitigation Console
      </p>

    </div>
  );
};

export default AdminLogin;
