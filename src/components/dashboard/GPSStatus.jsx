import { memo } from 'react';
import { shallow } from 'zustand/shallow';
import useDroneStore from '../../store/useDroneStore';

const GPSStatus = memo(() => {
  const gps = useDroneStore((s) => s.gps, shallow);
  const position = useDroneStore((s) => s.position, shallow);

  const getFixLabel = () => {
    switch (gps.fixType) {
      case 3: return { text: '3D Fix', color: 'text-drone-success' };
      case 2: return { text: '2D Fix', color: 'text-drone-warning' };
      default: return { text: 'No Fix', color: 'text-drone-danger' };
    }
  };

  const fix = getFixLabel();
  const hdopColor = gps.hdop < 1.5 ? 'text-drone-success' : gps.hdop < 3 ? 'text-drone-warning' : 'text-drone-danger';

  return (
    <div className="glass-card p-3 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-drone-text-dim">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            <path d="M2 12h20" />
          </svg>
          <span className="text-[10px] uppercase tracking-wider font-medium text-drone-text-dim">GPS</span>
        </div>
        <span className={`text-[10px] font-bold ${fix.color}`}>{fix.text}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <span className="text-[9px] text-drone-text-dim uppercase">Satellites</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-bold font-mono text-drone-accent">{gps.satellites}</span>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-drone-accent">
              <path d="M12 2L2 22h20L12 2z" />
            </svg>
          </div>
        </div>
        <div>
          <span className="text-[9px] text-drone-text-dim uppercase">HDOP</span>
          <span className={`text-xl font-bold font-mono block ${hdopColor}`}>{gps.hdop}</span>
        </div>
      </div>

      <div className="border-t border-drone-border pt-2">
        <div className="grid grid-cols-2 gap-1">
          <div>
            <span className="text-[9px] text-drone-text-dim">LAT</span>
            <span className="text-xs font-mono text-drone-text block">{position.lat.toFixed(6)}</span>
          </div>
          <div>
            <span className="text-[9px] text-drone-text-dim">LNG</span>
            <span className="text-xs font-mono text-drone-text block">{position.lng.toFixed(6)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-0.5 mt-2">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
              i < gps.satellites ? 'bg-drone-accent' : 'bg-drone-border'
            }`}
          />
        ))}
      </div>
    </div>
  );
});

export default GPSStatus;
