import React, { useState } from 'react';
import { ShieldAlert, AlertCircle, Clock, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { adminAPI } from '../../../../services/api';

const LiveAlertsPanel = ({ alerts = [], onAlertResolved }) => {
  const [filter, setFilter] = useState('ALL');
  const [resolvingId, setResolvingId] = useState(null);

  const activeAlerts = alerts.filter((a) => a.status !== 'RESOLVED');
  const resolvedAlerts = alerts.filter((a) => a.status === 'RESOLVED');

  const displayedAlerts =
    filter === 'ACTIVE'
      ? activeAlerts
      : filter === 'RESOLVED'
      ? resolvedAlerts
      : alerts;

  const handleResolve = async (alertId) => {
    try {
      setResolvingId(alertId);
      const res = await adminAPI.resolveAlert(alertId);
      if (res.data.success && onAlertResolved) {
        onAlertResolved(alertId);
      }
    } catch (err) {
      console.error('Error resolving alert:', err);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="glass-panel bg-admin-warning/5 border border-admin-warning/20 rounded-2xl flex flex-col h-full overflow-hidden shadow-2xl relative">
      <div className="p-4 border-b border-admin-warning/20 bg-black/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-amber-400 tracking-widest uppercase flex items-center gap-2">
              Behavioral SOC Threat Alerts
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                activeAlerts.length > 0
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold'
              }`}>
                {activeAlerts.length > 0 ? `${activeAlerts.length} Active` : '0 Active (Secured)'}
              </span>
            </h2>
            <p className="text-[10px] text-gray-500 font-mono tracking-widest">
              Live Neural Gateway Threat Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Filter Pills */}
          <div className="flex items-center bg-black/50 p-1 rounded-xl border border-white/10 text-[10px] font-mono">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filter === 'ALL'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All ({alerts.length})
            </button>
            <button
              onClick={() => setFilter('ACTIVE')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filter === 'ACTIVE'
                  ? 'bg-red-500/20 text-red-400 font-bold border border-red-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Active ({activeAlerts.length})
            </button>
            <button
              onClick={() => setFilter('RESOLVED')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filter === 'RESOLVED'
                  ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Resolved ({resolvedAlerts.length})
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            STREAMING
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-black/40 p-3 space-y-2.5 max-h-[460px]">
        {displayedAlerts.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xs font-mono flex flex-col items-center justify-center gap-2">
            <ShieldCheck size={32} className="text-emerald-500/40" />
            <span>No threat alerts matching filter. Threat vectors secured.</span>
          </div>
        ) : (
          displayedAlerts.map((alert) => {
            const isResolved = alert.status === 'RESOLVED';
            const isCritical = alert.risk === 'CRITICAL' || alert.risk === 'HIGH';

            return (
              <div
                key={alert.id || alert._id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col ${
                  isResolved
                    ? 'bg-black/30 border-emerald-500/20 opacity-70 hover:opacity-100'
                    : isCritical
                    ? 'bg-gradient-to-r from-red-950/30 to-black/60 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                    : 'bg-black/60 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]'
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[11px] font-black tracking-wider uppercase border px-2 py-0.5 rounded-md ${
                        isResolved
                          ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                          : isCritical
                          ? 'text-red-400 border-red-500/40 bg-red-500/20 animate-pulse'
                          : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                      }`}
                    >
                      {alert.type ? alert.type.replace(/_/g, ' ') : 'SECURITY EVENT'}
                    </span>

                    <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                      {alert.id}
                    </span>

                    {alert.mitigationAction && (
                      <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        {alert.mitigationAction.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-mono shrink-0">
                    <Clock size={11} />
                    {alert.time || 'Just now'}
                  </div>
                </div>

                <p className="text-xs text-gray-200 font-medium mb-2.5 leading-relaxed">
                  {alert.description}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-auto pt-2 border-t border-white/5 text-[10px] font-mono">
                  <div className="flex items-center gap-3 text-gray-400 truncate">
                    <span className="truncate max-w-[200px]" title={alert.user}>
                      Node: <strong className="text-white">{alert.user || 'Unknown'}</strong>
                    </span>
                    <span className="text-gray-500 shrink-0">IP: {alert.ip || '127.0.0.1'}</span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {isResolved ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        <CheckCircle2 size={12} /> Resolved
                      </span>
                    ) : (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        disabled={resolvingId === alert.id}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 hover:text-white border border-emerald-500/40 text-[10px] font-bold font-mono transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
                      >
                        {resolvingId === alert.id ? (
                          'Quarantining...'
                        ) : (
                          <>
                            <ShieldCheck size={12} /> Resolve Threat
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LiveAlertsPanel;
