import { memo } from 'react';
import { shallow } from 'zustand/shallow';
import useDroneStore from '../../store/useDroneStore';

const BatteryGauge = memo(() => {
  const battery = useDroneStore((s) => s.battery, shallow);

  const getColor = () => {
    if (battery.percentage >= 60) return { bar: '#10b981', glow: 'rgba(16,185,129,0.3)' };
    if (battery.percentage >= 30) return { bar: '#f59e0b', glow: 'rgba(245,158,11,0.3)' };
    return { bar: '#ef4444', glow: 'rgba(239,68,68,0.3)' };
  };

  const color = getColor();
  const cellVoltage = (battery.voltage / battery.cellCount).toFixed(2);

  return (
    <div className="glass-card p-3 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-drone-text-dim">
            <rect x="1" y="6" width="18" height="12" rx="2" />
            <path d="M23 10v4" />
          </svg>
          <span className="text-[10px] uppercase tracking-wider font-medium text-drone-text-dim">Battery</span>
        </div>
        <span className="text-[10px] text-drone-text-dim font-mono">{battery.cellCount}S</span>
      </div>

      <div className="flex items-baseline gap-1 mb-2">
        <span
          className="text-3xl font-bold font-mono"
          style={{ color: color.bar, textShadow: `0 0 10px ${color.glow}` }}
        >
          {battery.percentage}
        </span>
        <span className="text-sm text-drone-text-dim">%</span>
      </div>

      <div className="w-full h-2 bg-drone-border rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${battery.percentage}%`,
            background: `linear-gradient(90deg, ${color.bar}, ${color.bar}aa)`,
            boxShadow: `0 0 8px ${color.glow}`,
          }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col">
          <span className="text-[9px] text-drone-text-dim uppercase">Voltage</span>
          <span className="text-sm font-mono font-semibold text-drone-text">{battery.voltage}V</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] text-drone-text-dim uppercase">Current</span>
          <span className="text-sm font-mono font-semibold text-drone-text">{battery.current}A</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] text-drone-text-dim uppercase">Cell</span>
          <span className="text-sm font-mono font-semibold text-drone-text">{cellVoltage}V</span>
        </div>
      </div>

      <div className="flex gap-1 mt-2">
        {Array.from({ length: battery.cellCount }).map((_, i) => {
          const cv = parseFloat(cellVoltage);
          const pct = Math.max(0, Math.min(100, ((cv - 3.3) / (4.2 - 3.3)) * 100));
          return (
            <div key={i} className="flex-1 h-1 bg-drone-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${pct}%`,
                  backgroundColor: color.bar,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default BatteryGauge;
