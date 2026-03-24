import { memo } from 'react';
import useDroneStore from '../../store/useDroneStore';

const EmergencyPanel = memo(() => {
  const armed = useDroneStore((s) => s.armed);
  const setArmed = useDroneStore((s) => s.setArmed);
  const emergencyLand = useDroneStore((s) => s.emergencyLand);
  const returnToHome = useDroneStore((s) => s.returnToHome);

  return (
    <div className="glass-card p-4 flex flex-col gap-4 border-drone-danger/30">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-drone-danger uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-drone-danger" />
          Xavfsizlik boshqaruvi
        </h3>
        <span className="text-[10px] text-drone-text-dim font-mono">v1.0</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setArmed(!armed)}
          className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
            armed
              ? 'bg-drone-danger/10 border-drone-danger text-drone-danger hover:bg-drone-danger/20'
              : 'bg-drone-success/10 border-drone-success text-drone-success hover:bg-drone-success/20'
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span className="text-xs font-bold uppercase tracking-wider">
            {armed ? 'OʻCHIRISH' : 'YOQISH'}
          </span>
        </button>

        <button
          onClick={returnToHome}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-drone-warning bg-drone-warning/10 text-drone-warning hover:bg-drone-warning/20 transition-all duration-300"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
            <polyline points="9 10 4 15 9 20" />
            <path d="M20 4v7a4 4 0 01-4 4H4" />
          </svg>
          <span className="text-xs font-bold uppercase tracking-wider">UYGA</span>
        </button>
      </div>

      <button
        onClick={emergencyLand}
        className="group relative overflow-hidden flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-drone-danger text-white hover:scale-[0.98] active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-8 h-8">
          <path d="M12 2v20M8 18l4 4 4-4" />
        </svg>
        <div className="text-center">
          <span className="block text-sm font-black uppercase tracking-widest">Favqulodda qo'nish</span>
          <span className="text-[10px] opacity-70 font-medium">MOTORLARNI TOʻXTATISH</span>
        </div>
      </button>

      <div className="bg-drone-card border border-drone-border rounded-lg p-2 flex items-start gap-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-drone-warning mt-0.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <p className="text-[9px] text-drone-text-dim leading-tight">
          Ogohlantirish: Favqulodda harakatlar uskunaga zarar yetkazishi mumkin. Faqat xavfli holatda foydalaning.
        </p>
      </div>
    </div>
  );
});

export default EmergencyPanel;
