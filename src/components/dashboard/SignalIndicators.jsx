import { memo } from 'react';
import { shallow } from 'zustand/shallow';
import useDroneStore from '../../store/useDroneStore';

const SignalBar = memo(({ label, value, icon }) => {
  const getColor = (val) => {
    if (val >= 75) return 'bg-drone-success';
    if (val >= 50) return 'bg-drone-warning';
    return 'bg-drone-danger';
  };

  const getBars = (val) => {
    if (val >= 80) return 5;
    if (val >= 60) return 4;
    if (val >= 40) return 3;
    if (val >= 20) return 2;
    return 1;
  };

  const bars = getBars(value);
  const colorClass = getColor(value);

  return (
    <div className="glass-card p-3 flex flex-col gap-2 hover:glow-accent transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-drone-text-dim">{icon}</span>
          <span className="text-[10px] uppercase tracking-wider font-medium text-drone-text-dim">{label}</span>
        </div>
        <span className={`text-xs font-mono font-bold ${value >= 75 ? 'text-drone-success' : value >= 50 ? 'text-drone-warning' : 'text-drone-danger'}`}>
          {value}%
        </span>
      </div>
      <div className="flex items-end gap-0.5 h-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`flex-1 rounded-sm transition-all duration-300 ${
              i <= bars ? colorClass : 'bg-drone-border'
            }`}
            style={{ height: `${i * 20}%` }}
          />
        ))}
      </div>
    </div>
  );
});

const SignalIndicators = memo(() => {
  const signals = useDroneStore((s) => s.signals, shallow);

  const rcIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" />
    </svg>
  );

  const telIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 012.28-1.49M8.53 16.11a6 6 0 016.95 0M12 20h.01" />
    </svg>
  );

  const vidIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  );

  return (
    <div className="grid grid-cols-3 gap-2">
      <SignalBar label="RC" value={signals.rc} icon={rcIcon} />
      <SignalBar label="Telemetry" value={signals.telemetry} icon={telIcon} />
      <SignalBar label="Video" value={signals.video} icon={vidIcon} />
    </div>
  );
});

export default SignalIndicators;
