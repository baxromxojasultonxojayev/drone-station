import { useMemo } from 'react';

/**
 * A professional circular gauge for drone telemetry
 * @param {Object} props
 * @param {number} props.value - Current value
 * @param {number} props.min - Min value
 * @param {number} props.max - Max value
 * @param {string} props.label - Unit or short label
 * @param {string} props.title - gauge title
 * @param {string} props.color - CSS color for the arc
 * @param {number} props.size - pixel size
 */
export default function CircularGauge({ 
  value = 0, 
  min = 0, 
  max = 100, 
  label = '', 
  title = '', 
  color = 'var(--color-drone-accent)',
  size = 120 
}) {
  const radius = size * 0.4;
  const stroke = size * 0.08;
  const normalizedValue = Math.min(Math.max(value, min), max);
  const percentage = (normalizedValue - min) / (max - min);
  const circum = 2 * Math.PI * radius;
  
  // We use a 270 degree arc (from 135 to 405 degrees)
  const angleStart = 135;
  const angleEnd = 405;
  const arcSpan = angleEnd - angleStart;
  const dashOffset = circum - (percentage * (arcSpan / 360) * circum);

  // Tick marks
  const ticks = useMemo(() => {
    const t = [];
    for (let i = 0; i <= 10; i++) {
      const angle = angleStart + (i * (arcSpan / 10));
      const rad = (angle * Math.PI) / 180;
      const x1 = size/2 + Math.cos(rad) * (radius + 2);
      const y1 = size/2 + Math.sin(rad) * (radius + 2);
      const x2 = size/2 + Math.cos(rad) * (radius + 8);
      const y2 = size/2 + Math.sin(rad) * (radius + 8);
      t.push({ x1, y1, x2, y2, major: i % 5 === 0 });
    }
    return t;
  }, [size, radius, angleStart, arcSpan]);

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size + 20 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={stroke}
          strokeDasharray={circum}
          strokeDashoffset={circum * (1 - arcSpan / 360)}
          transform={`rotate(${angleStart} ${size / 2} ${size / 2})`}
          strokeLinecap="round"
        />
        
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circum}
          strokeDashoffset={dashOffset}
          transform={`rotate(${angleStart} ${size / 2} ${size / 2})`}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
          style={{ filter: `drop-shadow(0 0 4px ${color}44)` }}
        />

        {/* Tick Marks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.major ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)'}
            strokeWidth={t.major ? 1.5 : 1}
          />
        ))}
      </svg>

      {/* Value Overlay */}
      <div className="absolute inset-x-0 top-[35%] flex flex-col items-center justify-center leading-none">
        <span className="text-lg font-bold font-mono tracking-tighter" style={{ color }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        <span className="text-[9px] text-drone-text-dim font-medium uppercase mt-0.5">
          {label}
        </span>
      </div>

      {/* Title */}
      <div className="text-[10px] font-bold text-drone-text-dim/80 uppercase tracking-widest mt-1 text-center w-full">
        {title}
      </div>
    </div>
  );
}
