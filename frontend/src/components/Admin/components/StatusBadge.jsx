import React from 'react';

const StatusBadge = ({ type, status }) => {
    const statusConfig = {
        // Admin Statuses (Governance)
        'Active': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-bold',
        'Suspended': 'bg-amber-500/15 text-amber-300 border-amber-500/30 font-bold',
        'Blocked': 'bg-red-500/20 text-red-300 border-red-500/40 font-black shadow-[0_0_10px_rgba(239,68,68,0.2)]',

        // System Statuses (AI Anomaly Evaluation)
        'Safe': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'Suspicious': 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-bold',
        'HighRisk': 'bg-red-500/20 text-red-400 border-red-500/40 font-black animate-pulse',
    };

    const displayLabels = {
        'Safe': 'SAFE (LOW)',
        'Suspicious': 'SUSPICIOUS',
        'HighRisk': 'HIGH RISK'
    };

    const style = statusConfig[status] || 'bg-gray-500/10 text-gray-400 border-white/10';
    const displayedText = type === 'system' ? (displayLabels[status] || status) : status;

    return (
        <span className={`px-2.5 py-0.5 text-[9px] font-mono tracking-widest uppercase rounded-lg border ${style} inline-flex items-center gap-1.5 shrink-0 select-none`}>
            {displayedText}
        </span>
    );
};

export default StatusBadge;
