import { useState, memo, useMemo } from 'react';
import useDroneStore from '../store/useDroneStore';

const MissionVisualizer = memo(({ waypoints }) => {
  const points = useMemo(() => {
    if (waypoints.length === 0) return '';
    
    const margin = 40;
    const width = 600;
    const height = 300;
    
    // Scale waypoints to SVG viewbox
    // X axis: sequential distancing
    // Y axis: altitude (mapped 0-150m to 300-0px)
    
    return waypoints.map((wp, i) => {
      const x = margin + (i / Math.max(1, waypoints.length - 1)) * (width - margin * 2);
      const y = height - margin - (wp.alt / 150) * (height - margin * 2);
      return `${x},${y}`;
    }).join(' ');
  }, [waypoints]);

  return (
    <div className="flex-1 glass-card p-6 flex flex-col gap-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-drone-text-dim">Missiya vizualizatsiyasi</h3>
      <div className="flex-1 border-2 border-dashed border-drone-border rounded-2xl flex items-center justify-center relative overflow-hidden bg-drone-bg/50">
        <svg viewBox="0 0 600 300" className="w-full h-full">
          {/* Grid lines */}
          {[0, 50, 100, 150].map((alt) => {
            const y = 300 - 40 - (alt / 150) * (300 - 80);
            return (
              <g key={alt}>
                <line x1="40" y1={y} x2="560" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <text x="15" y={y + 3} fill="rgba(255,255,255,0.2)" fontSize="10" fontFamily="monospace">{alt}m</text>
              </g>
            );
          })}

          {waypoints.length > 1 && (
            <polyline
              points={points}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
              strokeDasharray={waypoints.length > 0 ? "none" : "8,8"}
            />
          )}

          {waypoints.map((wp, i) => {
            const x = 40 + (i / Math.max(1, waypoints.length - 1)) * (600 - 80);
            const y = 300 - 40 - (wp.alt / 150) * (300 - 80);
            return (
              <g key={wp.id} className="group cursor-help">
                <circle cx={x} cy={y} r="6" fill="#22d3ee" className="hover:r-8 transition-all" />
                <circle cx={x} cy={y} r="10" stroke="#22d3ee" strokeWidth="1" fill="none" className="animate-pulse opacity-30" />
                <text x={x} y={y - 12} fill="#22d3ee" fontSize="10" fontWeight="bold" textAnchor="middle">{i + 1}</text>
                
                {/* Tooltip on hover */}
                <rect x={x - 30} y={y + 15} width="60" height="20" rx="4" fill="#1a2035" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                <text x={x} y={y + 28} fill="white" fontSize="9" textAnchor="middle" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Alt: {wp.alt}m
                </text>
              </g>
            );
          })}
        </svg>

        {waypoints.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 pointer-events-none">
            <p className="text-drone-text-dim text-sm max-w-sm">
              3D nuqtalar vizualizatsiyasi va parvoz trayektoriyasini hisoblash tizimi. Nuqtalar qo'shilganidan so'ng trayektoriya chiziladi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

export default function MissionPlanner() {
  const mission = useDroneStore((s) => s.mission);
  const addWaypoint = useDroneStore((s) => s.addWaypoint);
  const removeWaypoint = useDroneStore((s) => s.removeWaypoint);
  const clearMission = useDroneStore((s) => s.clearMission);
  const [alt, setAlt] = useState(50);

  const addNewWaypoint = () => {
    const dronePos = useDroneStore.getState().position;
    addWaypoint({
      lat: dronePos.lat + (Math.random() - 0.5) * 0.005,
      lng: dronePos.lng + (Math.random() - 0.5) * 0.005,
      alt: alt,
      type: 'WAYPOINT',
    });
  };

  return (
    <div className="h-full w-full p-6 flex gap-6 overflow-hidden">
      {/* Nuqtalar ro'yxati */}
      <div className="w-80 glass-card flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-drone-border flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-drone-accent">Missiya rejasi</h3>
          <span className="text-[10px] font-mono text-drone-text-dim">{mission.waypoints.length} NP</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
          {mission.waypoints.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 opacity-40">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <p className="text-xs">Nuqtalar belgilanmagan.<br/>Xarita orqali qo'shing yoki avtomatik yarating.</p>
            </div>
          ) : (
            mission.waypoints.map((wp, i) => (
              <div key={wp.id} className="glass border border-drone-border/50 rounded-xl p-3 animate-fade-in group hover:glow-accent transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-drone-accent text-drone-bg text-[10px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-drone-text">{wp.type}</span>
                  </div>
                  <button
                    onClick={() => removeWaypoint(wp.id)}
                    className="opacity-0 group-hover:opacity-100 text-drone-danger hover:text-white transition-opacity"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div>
                    <span className="text-drone-text-dim block">KENG. (LAT)</span>
                    <span className="text-drone-text">{wp.lat.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="text-drone-text-dim block">UZUN. (LNG)</span>
                    <span className="text-drone-text">{wp.lng.toFixed(6)}</span>
                  </div>
                  <div className="col-span-2 mt-1 flex items-center justify-between border-t border-drone-border/30 pt-1">
                    <span className="text-drone-text-dim uppercase">Balandlik</span>
                    <span className="text-drone-accent font-bold">{wp.alt} m</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-drone-border flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-drone-text-dim">WP BAL.:</span>
            <input
              type="range"
              min="10"
              max="150"
              value={alt}
              onChange={(e) => setAlt(parseInt(e.target.value))}
              className="flex-1 accent-drone-accent h-1"
            />
            <span className="text-xs font-mono text-drone-accent w-8">{alt}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={addNewWaypoint}
              className="px-3 py-2 bg-drone-accent/10 border border-drone-accent text-drone-accent rounded-lg text-xs font-bold hover:bg-drone-accent transition-all duration-300 hover:text-drone-bg"
            >
              Nuqta qoʻshish
            </button>
            <button
              onClick={clearMission}
              className="px-3 py-2 bg-drone-danger/10 border border-drone-danger text-drone-danger rounded-lg text-xs font-bold hover:bg-drone-danger transition-all duration-300 hover:text-white"
            >
              Tozalash
            </button>
          </div>
          <button
            className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
              mission.waypoints.length > 0
                ? 'bg-drone-success text-drone-bg glow-accent'
                : 'bg-drone-border text-drone-text-dim cursor-not-allowed'
            }`}
          >
            Missiyani yuklash
          </button>
        </div>
      </div>

      <MissionVisualizer waypoints={mission.waypoints} />
    </div>
  );
}
