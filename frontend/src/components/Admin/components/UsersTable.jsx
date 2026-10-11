import React, { useState, useMemo } from 'react';
import UserRow from './UserRow';
import { adminAPI } from '../../../services/api';
import { Search, ShieldAlert, ShieldCheck, AlertTriangle, UserCheck, Filter, Users, X } from 'lucide-react';

const UsersTable = ({ users = [], fetchUsers, onSelectUser, title = "User Governance Directory" }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [systemFilter, setSystemFilter] = useState('ALL');
    const [adminFilter, setAdminFilter] = useState('ALL');
    const [loadingId, setLoadingId] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
    const [confirmModal, setConfirmModal] = useState({ show: false, userId: null, userName: '' });

    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4500);
    };

    const handleStatusChange = async (userId, newStatus) => {
        try {
            setLoadingId(userId);
            await adminAPI.updateUserStatus(userId, newStatus);
            showToast(`User administrative status successfully changed to ${newStatus}`, 'success');
            if (fetchUsers) await fetchUsers();
        } catch (error) {
            console.error('Failed to update status', error);
            showToast('Failed to update user status: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setLoadingId(null);
        }
    };

    const openSoftDeleteModal = (user) => {
        setConfirmModal({
            show: true,
            userId: user._id,
            userName: user.name || user.email,
        });
    };

    const executeSoftDelete = async () => {
        const { userId } = confirmModal;
        if (!userId) return;
        setConfirmModal({ show: false, userId: null, userName: '' });

        try {
            setLoadingId(userId);
            await adminAPI.deleteUser(userId);
            showToast('User quarantined and forensic soft-delete protocol enforced', 'success');
            if (fetchUsers) await fetchUsers();
        } catch (error) {
            console.error('Failed to delete user', error);
            showToast('Failed to soft delete user: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setLoadingId(null);
        }
    };

    // Filter & Search
    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const matchesSearch =
                (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());

            const matchesSystem = systemFilter === 'ALL' || u.systemStatus === systemFilter;
            const matchesAdmin = adminFilter === 'ALL' || u.adminStatus === adminFilter;

            return matchesSearch && matchesSystem && matchesAdmin;
        });
    }, [users, searchTerm, systemFilter, adminFilter]);

    // Metric Badges
    const safeCount = users.filter((u) => u.systemStatus === 'Safe').length;
    const suspiciousCount = users.filter((u) => u.systemStatus === 'Suspicious').length;
    const highRiskCount = users.filter((u) => u.systemStatus === 'HighRisk').length;

    return (
        <div className="glass-panel bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[480px] flex-1">
            {/* Header with Title and Metric Pills */}
            <div className="p-5 border-b border-white/10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-black/40">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            <Users size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white tracking-widest uppercase flex items-center gap-2">
                                {title}
                                <span className="text-xs font-mono font-normal text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                                    {users.length} Registered
                                </span>
                            </h3>
                            <p className="text-xs text-gray-400 font-mono tracking-wider">
                                Identity Behavioral Profiling & Governance Gateway
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Counter Badges */}
                <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Safe: {safeCount}
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        Suspicious: {suspiciousCount}
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        High Risk: {highRiskCount}
                    </span>
                </div>
            </div>

            {/* Filter and Search Toolbar */}
            <div className="p-4 border-b border-white/5 bg-black/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs font-mono">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search by identity, email or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 flex items-center gap-1">
                            <Filter size={12} /> AI Status:
                        </span>
                        <select
                            value={systemFilter}
                            onChange={(e) => setSystemFilter(e.target.value)}
                            className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-gray-300 focus:outline-none focus:border-cyan-400/50 cursor-pointer"
                        >
                            <option value="ALL">All AI States</option>
                            <option value="Safe">Safe</option>
                            <option value="Suspicious">Suspicious</option>
                            <option value="HighRisk">High Risk</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">Admin:</span>
                        <select
                            value={adminFilter}
                            onChange={(e) => setAdminFilter(e.target.value)}
                            className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-gray-300 focus:outline-none focus:border-cyan-400/50 cursor-pointer"
                        >
                            <option value="ALL">All Enforcements</option>
                            <option value="Active">Active</option>
                            <option value="Suspended">Suspended</option>
                            <option value="Blocked">Blocked</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* User Directory Table */}
            <div className="overflow-x-auto bg-black/20 flex-1">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-black/40 border-b border-white/10 text-[10px] font-mono tracking-widest text-gray-400 uppercase">
                        <tr>
                            <th className="py-3.5 px-6 font-semibold">User Identity</th>
                            <th className="py-3.5 px-4 text-center font-semibold text-cyan-400">Total Logins</th>
                            <th className="py-3.5 px-4 text-center font-semibold text-amber-400" title="Short Term vs Cumulative Failed Logins">
                                Failed (Recent/Total)
                            </th>
                            <th className="py-3.5 px-5 text-center font-semibold">AI Threat Vector</th>
                            <th className="py-3.5 px-5 text-center font-semibold text-purple-400">Admin Posture</th>
                            <th className="py-3.5 px-4 text-center font-semibold">Last Authentication</th>
                            <th className="py-3.5 px-6 text-center font-semibold">Governance Controls</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="py-16 text-center text-gray-500 font-mono text-xs tracking-widest">
                                    NO CORRESPONDING ENTITIES FOUND MATCHING CURRENT CRITERIA.
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <UserRow
                                    key={user._id}
                                    user={user}
                                    handleStatusChange={handleStatusChange}
                                    handleSoftDelete={() => openSoftDeleteModal(user)}
                                    onSelectUser={onSelectUser}
                                    isLoading={loadingId === user._id}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Soft Delete Protocol Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md rounded-3xl border border-red-500/40 bg-[#0f172a] p-6 shadow-2xl relative">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h4 className="text-base font-black uppercase tracking-wider text-white">
                                    Enforce Hard-Lock Protocol?
                                </h4>
                                <p className="text-xs text-gray-400 font-mono">
                                    Forensic Soft-Delete & Access Quarantine
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-gray-300 leading-relaxed font-sans mb-6">
                            Are you sure you want to quarantine <strong className="text-white font-mono">{confirmModal.userName}</strong>? This immediately locks all authorization tokens and blocks future session handshakes while permanently preserving forensic audit logs.
                        </p>

                        <div className="flex items-center justify-end gap-3 font-mono text-xs">
                            <button
                                onClick={() => setConfirmModal({ show: false, userId: null, userName: '' })}
                                className="px-4 py-2 rounded-xl text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeSoftDelete}
                                className="px-5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold transition-all"
                            >
                                Confirm Quarantine
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed bottom-6 right-6 px-5 py-3.5 rounded-2xl shadow-2xl z-[200] animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-3 border ${
                    toast.type === 'error'
                        ? 'bg-slate-900 border-red-500/50 text-red-300'
                        : 'bg-slate-900 border-emerald-500/50 text-emerald-300'
                }`}>
                    {toast.type === 'error' ? <AlertTriangle size={18} /> : <ShieldCheck size={18} />}
                    <span className="font-semibold text-xs text-white">{toast.message}</span>
                </div>
            )}
        </div>
    );
};

export default UsersTable;
