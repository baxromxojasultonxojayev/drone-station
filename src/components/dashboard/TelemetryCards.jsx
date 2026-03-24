import { memo } from 'react';
import { shallow } from 'zustand/shallow';
import useDroneStore from '../../store/useDroneStore';

const icons = {
  altitude: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M12 2v20M8 6l4-4 4 4M8 18l4 4 4-4" />
    </svg>
  ),
  speed: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  climb: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  heading: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <polygon points="12 2 19 21 12 17 5 21" />
    </svg>
  ),
};

const TelemetryValue = memo(({ label, value, unit, icon, color = 'text-drone-accent', trend }) => {
  return (
    <div className="glass-card p-3 flex flex-col gap-1 hover:glow-accent transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-drone-text-dim">
          <span className={color}>{icon}</span>
          <span className="text-[10px] uppercase tracking-wider font-medium">{label}</span>
        </div>
        {trend !== undefined && (
          <span className={`text-[10px] font-mono ${trend >= 0 ? 'text-drone-success' : 'text-drone-danger'}`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold font-mono ${color}`}>{value}</span>
        <span className="text-xs text-drone-text-dim">{unit}</span>
      </div>
    </div>
  );
});

const TelemetryCards = memo(() => {
  const position = useDroneStore((s) => s.position, shallow);
  const attitude = useDroneStore((s) => s.attitude, shallow);

  return (
    <div className="grid grid-cols-2 gap-2">
      <TelemetryValue
        label="Balandlik"
        value={position.relativeAlt.toFixed(1)}
        unit="m"
        icon={icons.altitude}
        color="text-drone-accent"
        trend={position.climbRate}
      />
      <TelemetryValue
        label="Tezlik"
        value={position.groundSpeed.toFixed(1)}
        unit="m/s"
        icon={icons.speed}
        color="text-drone-success"
      />
      <TelemetryValue
        label="Vertikal tezlik"
        value={position.climbRate.toFixed(2)}
        unit="m/s"
        icon={icons.climb}
        color={position.climbRate >= 0 ? 'text-drone-success' : 'text-drone-danger'}
      />
      <TelemetryValue
        label="Yoʻnalish (Kurs)"
        value={attitude.heading.toFixed(0)}
        unit="°"
        icon={icons.heading}
        color="text-drone-warning"
      />
    </div>
  );
});

export default TelemetryCards;
