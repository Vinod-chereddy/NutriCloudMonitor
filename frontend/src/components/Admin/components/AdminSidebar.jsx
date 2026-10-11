import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Activity, ShieldAlert, LayoutDashboard, GitMerge, ShieldCheck, UserCog, ShoppingBag } from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { useAuth } from '../../../context/AuthContext';

const AdminSidebar = ({ activeTab, setActiveTab, handleLogout, onLogout }) => {
    const navigate = useNavigate();
    const performLogout = handleLogout || onLogout;
    const { admin } = useAdminAuth();
    const { user } = useAuth();
    const activeEmail = admin?.email || user?.email || 'admin@healthcart.com';

    const navItems = [
        { key: 'overview', label: 'SOC Overview', desc: 'Real-Time Telemetry', icon: LayoutDashboard },
        { key: 'users', label: 'User Governance', desc: 'Identity Directory', icon: Users },
        { key: 'monitoring', label: 'Behavioral Logs', desc: 'Forensics & Anomalies', icon: Activity },
        { key: 'clickstream', label: 'Markov Matrix', desc: 'Path Intelligence', icon: GitMerge }
    ];

    return (
        <aside className="w-72 h-full shrink-0 z-20 border-r border-white/10 bg-[rgba(10,14,25,0.85)] backdrop-blur-2xl shadow-[12px_0_40px_rgba(0,0,0,0.35)] flex flex-col justify-between">
            <div>
                {/* Brand Logo Header */}
                <div className="relative p-6 border-b border-white/10 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-fuchsia-500/10 pointer-events-none" />
                    <div className="relative flex items-center gap-3.5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/15 shadow-[0_0_30px_rgba(34,211,238,0.25)]">
                            <ShieldAlert className="text-cyan-300 animate-pulse" size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-[0.14em] text-white">
                                NutriSOC
                            </h2>
                            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-400">
                                Defense Gateway v2.4
                            </p>
                        </div>
                    </div>
                </div>

                {/* Return to Storefront Quick Button */}
                <div className="px-3 pt-4 pb-1">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="group w-full overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-3 text-left transition-all duration-200 flex items-center gap-3 shadow-[0_4px_15px_rgba(16,185,129,0.1)] text-emerald-300 hover:text-white"
                        title="Return to NutriKart Storefront"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/15 text-emerald-300 shrink-0">
                            <ShoppingBag size={17} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-black uppercase tracking-wider truncate">
                                Return to Store
                            </p>
                            <p className="text-[10px] font-mono text-emerald-400/80 truncate">
                                NutriKart Shopping
                            </p>
                        </div>
                    </button>
                </div>

                {/* Navigation Menu */}
                <div className="px-3 py-3 space-y-2">
                    {navItems.map(({ key, label, desc, icon: Icon }) => {
                        const isActive = activeTab === key;

                        return (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`group relative w-full overflow-hidden rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 ${
                                    isActive
                                        ? 'border-cyan-400/30 bg-gradient-to-r from-cyan-400/15 via-blue-400/10 to-fuchsia-400/15 text-white shadow-[0_8px_24px_rgba(34,211,238,0.15)]'
                                        : 'border-transparent bg-white/[0.02] text-slate-400 hover:border-white/10 hover:bg-white/[0.07] hover:text-white'
                                }`}
                            >
                                <div className="flex items-center gap-3.5">
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all shrink-0 ${
                                            isActive
                                                ? 'border-cyan-300/30 bg-cyan-300/15 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                                                : 'border-white/8 bg-black/30 text-slate-400 group-hover:border-white/10 group-hover:text-slate-200'
                                        }`}
                                    >
                                        <Icon size={18} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className={`text-xs font-bold uppercase tracking-[0.16em] truncate ${isActive ? 'text-white' : ''}`}>
                                            {label}
                                        </p>
                                        <p className="text-[10px] font-mono text-gray-500 truncate mt-0.5">
                                            {desc}
                                        </p>
                                    </div>
                                </div>

                                {isActive && (
                                    <>
                                        <div className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                                        <div className="absolute -right-6 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-cyan-400/15 blur-2xl" />
                                    </>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Profile & Logout Footer */}
            <div className="border-t border-white/10 p-4 space-y-3 bg-black/40">
                {/* Admin Operator Badge */}
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0">
                        <UserCog size={16} />
                    </div>
                    <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                            <span>SOC Administrator</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono truncate">
                            {activeEmail}
                        </div>
                    </div>
                </div>

                <button
                    onClick={performLogout}
                    className="w-full rounded-xl border border-rose-400/20 bg-rose-500/10 hover:bg-rose-500/20 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-rose-300 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <LogOut size={14} />
                    Secure Logout
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
