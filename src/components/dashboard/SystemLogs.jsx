import { useRef, useEffect } from 'react';
import useDroneStore from '../../store/useDroneStore';

export default function SystemLogs() {
  const alerts = useDroneStore((state) => state.alerts);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0; // Newest on top
    }
  }, [alerts]);

  return (
    <div className="flex flex-col h-full bg-drone-surface border border-drone-border rounded-lg overflow-hidden">
      <div className="px-4 py-2 bg-drone-card border-b border-drone-border flex justify-between items-center">
        <h3 className="text-[10px] font-bold text-drone-text-dim uppercase tracking-widest">
          Tizim Loglari
        </h3>
        <span className="text-[9px] text-drone-accent font-mono animate-pulse">LIVE</span>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 custom-scrollbar"
      >
        {alerts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-drone-text-dim/30 italic text-xs">
            No system messages
          </div>
        ) : (
          alerts.map((alert) => (
            <div 
              key={alert.id}
              className={`text-xs font-mono py-1 px-2 border-l-2 flex flex-col gap-0.5 animate-fade-in ${
                alert.type === 'danger' ? 'border-drone-danger bg-drone-danger/5' :
                alert.type === 'warning' ? 'border-drone-warning bg-drone-warning/5' :
                'border-drone-accent bg-drone-accent/5'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`font-bold tracking-tight uppercase ${
                  alert.type === 'danger' ? 'text-drone-danger' :
                  alert.type === 'warning' ? 'text-drone-warning' :
                  'text-drone-accent'
                }`}>
                  [{new Date(alert.timestamp).toLocaleTimeString()}] {alert.type || 'INFO'}
                </span>
              </div>
              <p className="text-drone-text leading-tight">{alert.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
