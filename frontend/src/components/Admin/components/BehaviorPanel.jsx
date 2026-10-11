import React from 'react';
import { AlertTriangle, Activity, Zap, ShoppingCart, UserX } from 'lucide-react';

const BehaviorPanel = ({ anomalies, activities }) => {
    const suspiciousUsers = anomalies?.suspiciousLoginActivity || [];
    const rapidCheckouts = anomalies?.rapidCheckoutActivity || [];
    const hasAnomalies = suspiciousUsers.length > 0 || rapidCheckouts.length > 0;

    return (
        <div className="space-y-6 flex flex-col shrink-0">
            {/* System Behavioral Anomalies (AI-Flagged Vectors) */}
            {hasAnomalies ? (
                <div className="glass-panel bg-gradient-to-r from-amber-950/20 via-black/40 to-slate-900/40 rounded-2xl p-6 border border-amber-500/30 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center gap-3.5 mb-5 border-b border-white/10 pb-4">
                        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            <AlertTriangle size={22} className="animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-amber-300 tracking-widest uppercase">
                                System Behavioral Anomalies (AI-Flagged Vectors)
                            </h3>
                            <p className="text-xs text-gray-400 font-mono tracking-wider">
                                Autonomous Correlation & Velocity Heuristic Triggers
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                        {/* High Frequency Authentication Failures */}
                        <div className="bg-black/60 p-5 rounded-2xl border border-amber-500/20 flex flex-col">
                            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                                <span className="font-mono text-xs text-amber-300 tracking-widest uppercase flex items-center gap-2">
                                    <UserX size={15} /> High-Velocity Login Spikes
                                </span>
                                <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">
                                    {suspiciousUsers.length} Nodes
                                </span>
                            </div>

                            <div className="space-y-2.5">
                                {suspiciousUsers.length === 0 ? (
                                    <p className="text-xs text-gray-500 font-mono py-4 text-center">No brute-force clusters detected.</p>
                                ) : (
                                    suspiciousUsers.slice(0, 5).map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white/5 p-2.5 rounded-xl border border-white/5 hover:border-amber-500/30 transition-all">
                                            <div className="flex flex-col">
                                                <span className="text-gray-300 font-mono text-xs font-semibold">
                                                    Entity: {item._id ? String(item._id).slice(-8) : 'Unknown ID'}
                                                </span>
                                                <span className="text-[10px] text-gray-500 font-mono">
                                                    Last Spike: {item.lastLogin ? new Date(item.lastLogin).toLocaleTimeString() : 'Recent'}
                                                </span>
                                            </div>
                                            <span className="text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-lg font-mono text-xs font-bold tracking-wider border border-amber-500/30">
                                                {item.loginCount} ATTEMPTS
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Rapid Checkout Velocity */}
                        <div className="bg-black/60 p-5 rounded-2xl border border-blue-500/20 flex flex-col">
                            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                                <span className="font-mono text-xs text-blue-300 tracking-widest uppercase flex items-center gap-2">
                                    <ShoppingCart size={15} /> Rapid Checkout Velocity (Bot Waves)
                                </span>
                                <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">
                                    {rapidCheckouts.length} Nodes
                                </span>
                            </div>

                            <div className="space-y-2.5">
                                {rapidCheckouts.length === 0 ? (
                                    <p className="text-xs text-gray-500 font-mono py-4 text-center">Checkout velocities within baseline thresholds.</p>
                                ) : (
                                    rapidCheckouts.slice(0, 5).map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white/5 p-2.5 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all">
                                            <div className="flex flex-col">
                                                <span className="text-gray-300 font-mono text-xs font-semibold">
                                                    Entity: {item._id ? String(item._id).slice(-8) : 'Anonymous'}
                                                </span>
                                                <span className="text-[10px] text-gray-500 font-mono">
                                                    Bursts in &lt;1 hour
                                                </span>
                                            </div>
                                            <span className="text-blue-300 bg-blue-500/15 px-2.5 py-1 rounded-lg font-mono text-xs font-bold tracking-wider border border-blue-500/30">
                                                {item.checkoutCount} ORDERS
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-6 rounded-2xl bg-black/40 border border-emerald-500/20 text-center flex flex-col items-center justify-center gap-2">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                        <Activity size={20} />
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                        All Behavioral Vectors Operating Within Normal Statistical Tolerances
                    </span>
                    <span className="text-[11px] font-mono text-gray-500">
                        Zero automated clusters or rapid velocity surges detected.
                    </span>
                </div>
            )}
        </div>
    );
};

export default BehaviorPanel;
