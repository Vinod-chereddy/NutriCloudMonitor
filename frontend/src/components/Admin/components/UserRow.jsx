import React from 'react';
import StatusBadge from './StatusBadge';
import { ShieldOff, Lock, UserCheck, Trash2, Shield, Eye, AlertCircle } from 'lucide-react';

const UserRow = ({ user, handleStatusChange, handleSoftDelete, onSelectUser, isLoading }) => {
    const initials = (user.name || user.email || 'U')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const riskScore = user.riskScore || 0;
    const isHighRisk = riskScore >= 70;
    const isSuspicious = riskScore > 30 && riskScore < 70;

    return (
        <tr
            className={`transition-colors cursor-pointer group ${
                isHighRisk
                    ? 'hover:bg-red-500/10 bg-red-950/10'
                    : isSuspicious
                    ? 'hover:bg-amber-500/10 bg-amber-950/5'
                    : 'hover:bg-white/5'
            } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => onSelectUser && onSelectUser(user)}
        >
            {/* User Identity Details */}
            <td className="py-4 px-6">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                        isHighRisk
                            ? 'bg-red-500/20 text-red-300 border-red-500/30'
                            : isSuspicious
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                    }`}>
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <div className="font-bold text-white text-sm tracking-wide truncate group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                            <span>{user.name || 'Anonymous Entity'}</span>
                            {user.bmiCategory && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10 font-normal">
                                    {user.bmiCategory}
                                </span>
                            )}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono tracking-wider truncate">
                            {user.email}
                        </div>
                    </div>
                </div>
            </td>

            {/* Total Logins */}
            <td className="py-4 px-4 text-center text-gray-300 font-mono text-xs">
                {user.loginCount || 0}
            </td>

            {/* Failed Attempts (Recent / Total) */}
            <td className="py-4 px-4 text-center text-gray-400 font-mono text-xs">
                <span className={user.failedLoginAttempts > 0 ? "text-amber-400 font-bold drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" : "text-gray-300"}>
                    {user.failedLoginAttempts || 0}
                </span>
                <span className="text-gray-600 mx-1.5">/</span>
                <span className={user.totalFailedAttempts > 5 ? "text-red-400 font-bold drop-shadow-[0_0_8px_rgba(248,113,113,0.4)]" : "text-gray-500"}>
                    {user.totalFailedAttempts || 0}
                </span>
            </td>

            {/* AI Threat Vector & Risk Score Meter */}
            <td className="py-4 px-5 text-center">
                <div className="flex flex-col items-center gap-1.5">
                    <StatusBadge type="system" status={user.systemStatus || 'Safe'} />
                    <div className="w-20 bg-black/50 rounded-full h-1.5 overflow-hidden border border-white/10">
                        <div
                            className={`h-full transition-all duration-500 ${
                                isHighRisk
                                    ? 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                                    : isSuspicious
                                    ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                                    : 'bg-emerald-400'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(5, riskScore))}%` }}
                        />
                    </div>
                    <span className="text-[9px] font-mono text-gray-400">
                        SCORE: <strong className={isHighRisk ? 'text-red-400' : isSuspicious ? 'text-amber-400' : 'text-emerald-400'}>{riskScore}</strong>/100
                    </span>
                </div>
            </td>

            {/* Admin Governance Status */}
            <td className="py-4 px-5 text-center">
                <StatusBadge type="admin" status={user.adminStatus || 'Active'} />
            </td>

            {/* Last Authentication */}
            <td className="py-4 px-4 text-center text-[10px] text-gray-400 font-mono tracking-widest uppercase">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'NEVER'}
            </td>

            {/* Governance Action Buttons */}
            <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-center gap-1.5">
                    {/* View Profile */}
                    <button
                        onClick={() => onSelectUser && onSelectUser(user)}
                        className="p-2 text-cyan-400 hover:bg-cyan-500/20 border border-transparent hover:border-cyan-500/30 rounded-xl transition-all"
                        title="Open Forensic Audit Profile"
                    >
                        <Eye size={15} />
                    </button>

                    {/* Activate */}
                    {user.adminStatus !== 'Active' && (
                        <button
                            onClick={() => handleStatusChange(user._id, 'Active')}
                            className="p-2 text-emerald-400 hover:bg-emerald-500/20 border border-transparent hover:border-emerald-500/30 rounded-xl transition-all"
                            title="Activate & Restore Standard Access"
                        >
                            <UserCheck size={15} />
                        </button>
                    )}

                    {/* Suspend */}
                    {user.adminStatus !== 'Suspended' && (
                        <button
                            onClick={() => handleStatusChange(user._id, 'Suspended')}
                            className="p-2 text-amber-400 hover:bg-amber-500/20 border border-transparent hover:border-amber-500/30 rounded-xl transition-all"
                            title="Suspend Account Access"
                        >
                            <ShieldOff size={15} />
                        </button>
                    )}

                    {/* Block */}
                    {user.adminStatus !== 'Blocked' && (
                        <button
                            onClick={() => handleStatusChange(user._id, 'Blocked')}
                            className="p-2 text-red-400 hover:bg-red-500/20 border border-transparent hover:border-red-500/30 rounded-xl transition-all"
                            title="Hard-Lock & Block Account"
                        >
                            <Lock size={15} />
                        </button>
                    )}

                    <div className="w-px h-4 bg-white/10 mx-1"></div>

                    {/* Soft Delete / Quarantine */}
                    <button
                        onClick={() => handleSoftDelete(user)}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl transition-all"
                        title="Quarantine User (Preserve Forensic Data)"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default UserRow;
