import { useEffect, useState } from 'react';
import useDroneStore from '../../store/useDroneStore';

export default function HUDOverlay() {
  const [telemetry, setTelemetry] = useState(useDroneStore.getState());

  useEffect(() => {
    // High-frequency UI update for HUD
    const unsubscribe = useDroneStore.subscribe((state) => {
      setTelemetry(state);
    });
    return () => unsubscribe();
  }, []);

  const { attitude, position, flightMode, armed } = telemetry;

  return (
    <div className="absolute inset-0 pointer-events-none select-none font-mono">
      {/* Central Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-40 h-40 border border-white/20 rounded-full">
          <div className="absolute top-1/2 left-0 w-8 h-[2px] bg-drone-accent -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-0 w-8 h-[2px] bg-drone-accent -translate-y-1/2"></div>
          <div className="absolute top-0 left-1/2 w-[2px] h-4 bg-drone-accent -translate-x-1/2"></div>
          <div className="absolute bottom-0 left-1/2 w-[2px] h-4 bg-drone-accent -translate-x-1/2"></div>
          
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-1.5 h-1.5 bg-drone-accent rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Pitch Ladder (Simplified for Overlay) */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div 
          className="transition-transform duration-100 ease-linear"
          style={{ transform: `rotate(${-attitude.roll}deg) translateY(${attitude.pitch * 4}px)` }}
        >
          {[-20, -10, 0, 10, 20].map((deg) => (
            <div key={deg} className="relative flex items-center justify-center h-20">
              <div className={`w-32 h-[1px] ${deg === 0 ? 'bg-white' : 'bg-white/40'} flex justify-between px-2`}>
                <span className="text-[10px] -mt-3">{Math.abs(deg)}</span>
                <span className="text-[10px] -mt-3">{Math.abs(deg)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Status Bar */}
      <div className="absolute top-6 inset-x-0 flex justify-between px-8">
        <div className="flex flex-col gap-1">
          <div className="bg-black/60 px-3 py-1 border-l-4 border-drone-accent flex items-center gap-4">
            <span className="text-drone-text-dim text-[10px]">MODE:</span>
            <span className="text-drone-accent font-bold text-xs tracking-widest">{flightMode}</span>
          </div>
          <div className={`bg-black/60 px-3 py-0.5 border-l-4 ${armed ? 'border-drone-danger' : 'border-drone-success'} flex items-center gap-4`}>
            <span className="text-drone-text-dim text-[10px]">ARM:</span>
            <span className={`font-bold text-[10px] ${armed ? 'text-drone-danger' : 'text-drone-success'}`}>
              {armed ? 'ACTIVE' : 'READY'}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 text-right">
          <div className="bg-black/60 px-3 py-1 flex items-center gap-4">
             <span className="text-drone-text-dim text-[10px]">HDG:</span>
             <span className="text-white text-xs font-bold">{Math.round(attitude.heading)}°</span>
          </div>
          <div className="bg-black/60 px-3 py-1 flex items-center gap-4">
             <span className="text-drone-text-dim text-[10px]">SPD:</span>
             <span className="text-white text-xs font-bold">{position.airSpeed} m/s</span>
          </div>
        </div>
      </div>

      {/* Bottom Telemetry Mini-Strip */}
      <div className="absolute bottom-6 inset-x-12 flex justify-between bg-black/40 backdrop-blur-sm border border-white/10 p-2">
        <div className="flex gap-6">
          <div className="flex flex-col">
            <span className="text-[8px] text-drone-text-dim">LAT</span>
            <span className="text-[10px] text-white font-mono">{position.lat.toFixed(5)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] text-drone-text-dim">LNG</span>
            <span className="text-[10px] text-white font-mono">{position.lng.toFixed(5)}</span>
          </div>
        </div>
        
        <div className="flex gap-8 items-center pr-4">
           <div className="flex flex-col items-end">
              <span className="text-[8px] text-drone-text-dim uppercase">AGL (m)</span>
              <span className="text-drone-accent font-bold text-lg leading-none">{Math.round(position.relativeAlt)}</span>
           </div>
        </div>
      </div>

      {/* Corner Brackets */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/40"></div>
      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/40"></div>
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/40"></div>
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/40"></div>
    </div>
  );
}
