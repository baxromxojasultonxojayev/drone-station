import { memo } from 'react';
import useDroneStore from '../../store/useDroneStore';

const TopBar = memo(() => {
  const connected = useDroneStore((s) => s.connected);
  const connectionType = useDroneStore((s) => s.connectionType);
  const flightMode = useDroneStore((s) => s.flightMode);
  const armed = useDroneStore((s) => s.armed);

  const getConnectionType = (type) => {
    switch (type) {
      case 'simulation': return 'Simulyatsiya';
      case 'websocket': return 'Tarmoq';
      case 'serial': return 'Serial port';
      default: return type;
    }
  };

  return (
    <header className="h-14 glass border-b border-drone-border flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-6">
        <div className="flex items-baseline gap-2">
          <h1 className="text-lg font-black tracking-tighter text-drone-text italic">
            DRONE<span className="text-drone-accent">STATION</span>
          </h1>
          <span className="text-[10px] text-drone-text-dim font-mono tracking-widest uppercase">v1.0 Boshqaruv markazi</span>
        </div>

        <div className="h-6 w-px bg-drone-border" />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-drone-success' : 'bg-drone-danger'}`} />
            <span className="text-[10px] uppercase font-bold tracking-wider text-drone-text-dim">
              {connected ? `${getConnectionType(connectionType)} aloqasi` : 'Aloqa yoʻq'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded bg-drone-card border border-drone-border text-[10px] font-mono font-bold ${armed ? 'text-drone-danger' : 'text-drone-success'}`}>
              {armed ? 'FAOL' : 'OʻCHIK'}
            </span>
            <span className="px-2 py-0.5 rounded bg-drone-accent/10 border border-drone-accent/30 text-[10px] font-mono font-bold text-drone-accent">
              {flightMode}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-mono text-drone-text leading-none">TAS: 12.4 m/s</span>
          <span className="text-[10px] font-mono text-drone-text-dim leading-none">GS: 11.8 m/s</span>
        </div>
        <div className="h-6 w-px bg-drone-border" />
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-mono text-drone-text leading-none">24 MAR 2026</span>
          <span className="text-[10px] font-mono text-drone-text-dim leading-none">12:45:00 UTC</span>
        </div>
      </div>
    </header>
  );
});

export default TopBar;
