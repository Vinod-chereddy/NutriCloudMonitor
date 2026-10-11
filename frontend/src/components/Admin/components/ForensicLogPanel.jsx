import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../services/api';
import { Activity, ShieldAlert, ArrowLeft, Search, Filter, Clock, Globe, Monitor, UserCheck, ShieldOff, Lock, CheckCircle2 } from 'lucide-react';
import StatusBadge from './StatusBadge';

const ForensicLogPanel = ({ user, onClose, onBack }) => {
    const handleBack = onClose || onBack;
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [userRecord, setUserRecord] = useState(user);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    useEffect(() => {
        if (user) {
            setUserRecord(user);
            fetchLogs();
        }
    }, [user]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await adminAPI.getUserActivity(user._id, { limit: 150 });
            setLogs(res.data.activities || []);
        } catch (error) {
            console.error('Failed to fetch user activity', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            setIsUpdatingStatus(true);
            const res = await adminAPI.updateUserStatus(userRecord._id, newStatus);
            if (res.data.success) {
                setUserRecord((prev) => ({ ...prev, adminStatus: newStatus }));
                setToastMessage(`Admin governance status updated to ${newStatus}`);
                setTimeout(() => setToastMessage(null), 4000);
            }
        } catch (err) {
            console.error('Failed to update status in forensic profile:', err);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const securityActions = [
        'login', 'login_failed', 'signup', 'logout',
        'LOGIN_SUCCESS', 'LOGIN_FAILURE', 'LOGOUT',
        'MULTIPLE_FAILED_ATTEMPTS', 'HIGH_RISK_SCORE',
        'NEW_DEVICE_LOGIN', 'NEW_LOCATION_LOGIN',
        'TOKEN_EXPIRED', 'RAPID_REQUESTS', 'MALICIOUS_PAYLOAD_DETECTED',
        'UNUSUAL_TIME_LOGIN'
    ];

    const filteredLogs = logs.filter((l) => {
        const query = searchTerm.toLowerCase();
        return (
            l.action.toLowerCase().includes(query) ||
            (l.ipAddress || '').includes(query) ||
            JSON.stringify(l.details || {}).toLowerCase().includes(query)
        );
    });

    const websiteLogs = filteredLogs.filter(l => !securityActions.includes(l.action));
    const securityLogs = filteredLogs.filter(l => securityActions.includes(l.action));

    const riskScore = userRecord?.riskScore || 0;
    const isHighRisk = riskScore >= 70;
    const isSuspicious = riskScore > 30 && riskScore < 70;

    return (
        <div className="flex flex-col space-y-6 animate-in fade-in duration-300">
            {/* Top Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <button
                    onClick={handleBack}
                    className="flex text-cyan-300 hover:text-white items-center gap-2.5 text-xs font-bold font-mono uppercase tracking-widest transition-all bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl w-fit"
                >
                    <ArrowLeft size={16} /> Back to Governance Directory
                </button>

                {toastMessage && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono">
                        <CheckCircle2 size={14} />
                        {toastMessage}
                    </div>
                )}
            </div>

            {/* Entity Forensic Identity Header Card */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-black/80 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg border shrink-0 ${
                            isHighRisk
                                ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                                : isSuspicious
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                        }`}>
                            {(userRecord.name || userRecord.email || 'U').slice(0, 2).toUpperCase()}
                        </div>

                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h2 className="text-xl font-black text-white tracking-wide">
                                    {userRecord.name || 'Anonymous Entity'}
                                </h2>
                                <StatusBadge type="system" status={userRecord.systemStatus || 'Safe'} />
                                <StatusBadge type="admin" status={userRecord.adminStatus || 'Active'} />
                                {userRecord.bmiCategory && (
                                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                                        BMI: {userRecord.bmiCategory} ({userRecord.bmi || 'N/A'})
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 font-mono tracking-wider mt-1">
                                {userRecord.email} <span className="text-gray-600">•</span> UUID: {userRecord._id}
                            </p>
                        </div>
                    </div>

                    {/* Threat Score Progress Meter & Quick Enforcements */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className="flex flex-col gap-1.5 min-w-[140px]">
                            <div className="flex justify-between text-xs font-mono">
                                <span className="text-gray-400">Threat Score:</span>
                                <strong className={isHighRisk ? 'text-red-400' : isSuspicious ? 'text-amber-400' : 'text-emerald-400'}>
                                    {riskScore} / 100
                                </strong>
                            </div>
                            <div className="w-36 bg-black/60 rounded-full h-2 overflow-hidden border border-white/10">
                                <div
                                    className={`h-full transition-all duration-500 ${
                                        isHighRisk ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : isSuspicious ? 'bg-amber-400' : 'bg-emerald-400'
                                    }`}
                                    style={{ width: `${Math.min(100, Math.max(5, riskScore))}%` }}
                                />
                            </div>
                            <span className="text-[9px] font-mono text-gray-500">
                                Total Logins: {userRecord.loginCount || 0} | Failures: {userRecord.failedLoginAttempts || 0}
                            </span>
                        </div>

                        {/* Direct Enforcement Actions */}
                        <div className="flex items-center gap-2 border-l border-white/10 pl-6 text-xs font-mono">
                            <span className="text-gray-500 text-[10px] uppercase tracking-wider block sm:hidden">Posture:</span>
                            <button
                                onClick={() => handleUpdateStatus('Active')}
                                disabled={isUpdatingStatus || userRecord.adminStatus === 'Active'}
                                className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                                    userRecord.adminStatus === 'Active'
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                                        : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <UserCheck size={14} /> Active
                            </button>
                            <button
                                onClick={() => handleUpdateStatus('Suspended')}
                                disabled={isUpdatingStatus || userRecord.adminStatus === 'Suspended'}
                                className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                                    userRecord.adminStatus === 'Suspended'
                                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                                        : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <ShieldOff size={14} /> Suspend
                            </button>
                            <button
                                onClick={() => handleUpdateStatus('Blocked')}
                                disabled={isUpdatingStatus || userRecord.adminStatus === 'Blocked'}
                                className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                                    userRecord.adminStatus === 'Blocked'
                                        ? 'bg-red-500/20 text-red-300 border-red-500/40 font-bold'
                                        : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <Lock size={14} /> Block
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                    type="text"
                    placeholder="Filter forensic activity logs (actions, IPs, parameters)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-cyan-400/50 transition-colors"
                />
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center p-20">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-3 border-cyan-400 border-t-transparent" />
                        <span className="text-xs font-mono text-gray-500">Querying Forensic Telemetry Logs...</span>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">
                    {/* Left Column: Security & Authentication Events */}
                    <div className="glass-panel bg-red-950/5 border border-red-500/20 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
                        <div className="px-5 py-4 border-b border-red-500/20 flex items-center justify-between bg-black/60 shrink-0">
                            <div className="flex items-center gap-3">
                                <ShieldAlert className="text-red-400" size={18} />
                                <div>
                                    <h3 className="text-xs font-bold text-red-300 tracking-widest uppercase">
                                        Security & Perimeter Access Events
                                    </h3>
                                    <p className="text-[10px] text-gray-500 font-mono tracking-wider">
                                        {securityLogs.length} Events Logged
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-white/5 bg-black/30 p-3 max-h-[550px] overflow-y-auto space-y-1.5 custom-scrollbar">
                            {securityLogs.length === 0 ? (
                                <p className="text-center text-gray-500 font-mono text-xs tracking-widest p-10">
                                    NO ADVERSARIAL OR SECURITY INCIDENTS RECORDED
                                </p>
                            ) : (
                                securityLogs.map(log => <LogItem key={log._id} log={log} isSecurity={true} />)
                            )}
                        </div>
                    </div>

                    {/* Right Column: Application Behavior & Commerce Flow */}
                    <div className="glass-panel bg-white/5 border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
                        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-black/60 shrink-0">
                            <div className="flex items-center gap-3">
                                <Activity className="text-cyan-400" size={18} />
                                <div>
                                    <h3 className="text-xs font-bold text-white tracking-widest uppercase">
                                        User Engagement & Commerce Forensics
                                    </h3>
                                    <p className="text-[10px] text-gray-500 font-mono tracking-wider">
                                        {websiteLogs.length} Events Logged
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-white/5 bg-black/20 p-3 max-h-[550px] overflow-y-auto space-y-1.5 custom-scrollbar">
                            {websiteLogs.length === 0 ? (
                                <p className="text-center text-gray-500 font-mono text-xs tracking-widest p-10">
                                    NO COMMERCE ACTIVITY LOGGED
                                </p>
                            ) : (
                                websiteLogs.map(log => <LogItem key={log._id} log={log} />)
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const LogItem = ({ log, isSecurity }) => {
    const actionColors = {
        login_success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        login_failed: 'bg-red-500/15 text-red-400 border-red-500/30 font-bold',
        login: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        signup: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        bmi_calculation: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        view_product: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        add_to_cart: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        checkout: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
        logout: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        PAGE_TRANSITION: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
        BMI_CALCULATED: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        MULTIPLE_BMI_ATTEMPTS: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        RAPID_REQUESTS: 'bg-red-500/15 text-red-400 border-red-500/30',
        MALICIOUS_PAYLOAD_DETECTED: 'bg-red-600/20 text-red-400 border-red-600/40 font-black animate-pulse',
        SESSION_START: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        SESSION_END: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        LOGIN_SUCCESS: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        LOGIN_FAILURE: 'bg-red-500/15 text-red-400 border-red-500/30 font-bold',
        MULTIPLE_FAILED_ATTEMPTS: 'bg-red-500/20 text-red-400 border-red-500/40 font-bold',
        HIGH_RISK_SCORE: 'bg-red-600/20 text-red-500 border-red-600/40 font-black animate-pulse',
        NEW_DEVICE_LOGIN: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        NEW_LOCATION_LOGIN: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        UNUSUAL_TIME_LOGIN: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        TOKEN_EXPIRED: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        LOGOUT: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };

    const style = actionColors[log.action] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';

    return (
        <div className="p-3.5 hover:bg-white/5 transition-all flex flex-col rounded-xl bg-black/40 border border-white/5">
            <div className="flex items-center justify-between gap-2 mb-2">
                <div className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-widest border uppercase ${style}`}>
                    {log.action.replace(/_/g, ' ')}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                    <Clock size={11} className="text-gray-500" />
                    <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                    <span className="text-gray-600">•</span>
                    <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                </div>
            </div>

            {isSecurity ? (
                <div className="flex flex-col gap-1.5 mt-1">
                    <div className="flex items-center gap-2">
                        {log.ipAddress && (
                            <span className="text-[10px] text-gray-400 font-mono px-2 py-0.5 rounded bg-black/60 border border-white/10 flex items-center gap-1">
                                <Globe size={11} className="text-cyan-400" /> {log.ipAddress}
                            </span>
                        )}
                        <span className="text-[10px] text-gray-500 font-mono truncate" title={log.userAgent}>
                            {log.userAgent || 'Unknown Node Signature'}
                        </span>
                    </div>
                    {log.details && Object.keys(log.details).length > 0 && (
                        <div className="text-[11px] text-gray-300 font-mono bg-black/60 p-2 rounded-lg border border-white/5 overflow-x-auto">
                            {JSON.stringify(log.details)}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-[11px] text-gray-300 font-mono bg-black/50 p-2 rounded-lg border border-white/5 overflow-x-auto">
                    {JSON.stringify(log.details || {})}
                </div>
            )}
        </div>
    );
};

export default ForensicLogPanel;
