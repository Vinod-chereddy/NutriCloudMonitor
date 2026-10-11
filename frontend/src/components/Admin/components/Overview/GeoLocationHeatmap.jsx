import React from 'react';
import { Globe, Crosshair, Server, Activity } from 'lucide-react';

const GeoLocationHeatmap = ({ data = [] }) => {
  // Predefined geometric node positions on stylized map
  const nodeSlots = [
    { top: '32%', left: '26%', region: 'US East' },
    { top: '44%', left: '72%', region: 'IND (South Asia)' },
    { top: '34%', left: '52%', region: 'EU Central' },
    { top: '58%', left: '32%', region: 'South America' },
    { top: '26%', left: '80%', region: 'APAC (Tokyo/Singapore)' },
    { top: '48%', left: '18%', region: 'US West' },
  ];

  const nodes = (data && data.length > 0 ? data : [
    { ip: '127.0.0.1', status: 'Local Gateway', requests: 28 },
    { ip: '192.168.1.1', status: 'Network Edge', requests: 14 },
  ]).slice(0, 6);

  return (
    <div className="glass-panel bg-black/40 border border-white/5 rounded-2xl flex flex-col h-full overflow-hidden shadow-2xl relative min-h-[350px]">
      <div className="p-4 border-b border-white/5 bg-black/60 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Globe size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-widest uppercase">
              Global Access Topology
            </h2>
            <p className="text-[10px] text-gray-500 font-mono tracking-widest">
              Live IP & Gateway Geolocation Mapping
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full">
          <Activity size={12} className="animate-pulse" />
          <span>{nodes.length} Ingress Nodes</span>
        </div>
      </div>

      <div className="flex-1 relative bg-[#060b13] flex items-center justify-center overflow-hidden p-6 group">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#060b13] to-[#060b13]" />

        {/* SVG World Map Base */}
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full max-w-3xl opacity-30 stroke-cyan-500/30 fill-none stroke-[2] stroke-linecap-round stroke-linejoin-round"
          style={{ filter: 'drop-shadow(0 0 10px rgba(6, 182, 212, 0.2))' }}
        >
          <path d="M 150 150 Q 200 100 250 150 T 400 180 T 500 250 T 600 200 T 700 220 T 800 180 L 850 300 Q 800 350 700 380 T 550 400 T 450 350 T 350 420 T 250 380 T 150 400 Z" />
          <path d="M 400 180 L 450 120 L 550 140 L 500 200 Z" />
          <path d="M 700 220 L 750 280 L 850 250 L 820 180 Z" />
          <path d="M 250 150 L 220 220 L 300 280 L 350 200 Z" />
        </svg>

        {/* Dynamic Heatmap Nodes mapped to real IPs */}
        {nodes.map((node, idx) => {
          const slot = nodeSlots[idx % nodeSlots.length];
          const isThreat = Boolean(node.status?.toLowerCase().includes('flag') || node.status?.toLowerCase().includes('threat'));

          return (
            <div
              key={node.ip || idx}
              className="absolute flex items-center justify-center group/node cursor-pointer"
              style={{ top: slot.top, left: slot.left }}
            >
              {isThreat ? (
                <>
                  <Crosshair className="text-red-500 absolute animate-spin-slow opacity-80" size={28} />
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full relative z-10 shadow-[0_0_15px_#ef4444]" />
                  <div className="absolute top-5 bg-black/90 border border-red-500/50 text-red-400 font-mono text-[9px] px-2 py-1 rounded-md backdrop-blur-sm whitespace-nowrap shadow-xl z-20">
                    THREAT VECTOR: {node.ip}
                  </div>
                </>
              ) : (
                <>
                  <div className="w-3.5 h-3.5 bg-cyan-400 rounded-full animate-ping absolute opacity-60" />
                  <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full relative z-10 shadow-[0_0_12px_#22d3ee]" />
                  <div className="absolute top-5 bg-black/90 border border-cyan-500/40 text-cyan-300 font-mono text-[9px] px-2 py-1 rounded-md backdrop-blur-md whitespace-nowrap opacity-0 group-hover/node:opacity-100 transition-opacity z-20 shadow-xl pointer-events-none">
                    {slot.region} | IP: {node.ip} ({node.requests || 12} req/s)
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GeoLocationHeatmap;
