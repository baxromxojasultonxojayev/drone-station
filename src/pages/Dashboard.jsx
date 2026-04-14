import ArtificialHorizon from '../components/dashboard/ArtificialHorizon';
import CircularGauge from '../components/dashboard/CircularGauge';
import HUDOverlay from '../components/dashboard/HUDOverlay';
import SystemLogs from '../components/dashboard/SystemLogs';
import GPSStatus from '../components/dashboard/GPSStatus';
import BatteryGauge from '../components/dashboard/BatteryGauge';
import SignalIndicators from '../components/dashboard/SignalIndicators';
import MapView from './MapView'; // Reuse the existing map view
import useDroneStore from '../store/useDroneStore';

export default function Dashboard() {
  const motors = useDroneStore((state) => state.motors);
  const esc = useDroneStore((state) => state.esc);

  return (
    <div className="h-full w-full bg-[#05070a] text-drone-text p-2 flex flex-col gap-2 overflow-hidden">
      
      {/* Upper Section (Main Dashboard) */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-2">
        
        {/* BLOCK A: LEFT COLUMN (Status & Indicators) */}
        <div className="col-span-12 lg:col-span-3 xl:col-span-2 flex flex-col gap-2 min-h-0 overflow-y-auto pr-1">
          <div className="glass-card p-3 border-drone-accent/20">
            <h3 className="text-[10px] font-bold text-drone-accent uppercase mb-3 tracking-widest">Holat Indikatorlari</h3>
            <div className="flex flex-col gap-3">
              <BatteryGauge />
              <div className="h-px bg-drone-border w-full"></div>
              <GPSStatus />
              <div className="h-px bg-drone-border w-full"></div>
              <SignalIndicators />
            </div>
          </div>
          
          <div className="mt-auto glass-card p-2 text-center border-drone-danger/20 ring-1 ring-drone-danger/10">
            <span className="text-[10px] text-drone-danger font-bold uppercase animate-pulse">Emergency Failsafe Active</span>
          </div>
        </div>

        {/* CENTER COLUMN (PFD & HUD VIDEO) */}
        <div className="col-span-12 lg:col-span-6 xl:col-span-8 flex flex-col gap-2 min-h-0">
          
          {/* BLOCK B: CENTER TOP (Primary Flight Display) */}
          <div className="flex-[4] min-h-0 bg-black/40 border border-drone-border rounded-lg relative overflow-hidden group">
            <div className="absolute top-2 left-4 z-10">
              <span className="text-[10px] font-bold text-drone-text-dim uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded">PFD - Primary Flight Display</span>
            </div>
            <ArtificialHorizon />
          </div>

          {/* BLOCK C: CENTER BOTTOM (Camera Feed + HUD) */}
          <div className="flex-[5] min-h-0 bg-drone-surface border border-drone-border rounded-lg relative overflow-hidden group">
             {/* SIMULATED VIDEO FEED PLACEHOLDER */}
             <div className="absolute inset-0 bg-[#0c121d] flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* Grid overlay for simulation feel */}
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#22d3ee 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                  
                  {/* Simulated "Bayraktar TB2" style camera view with simple plane silhouette if mission active */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
                    <svg viewBox="0 0 200 100" className="w-1/3 text-white">
                      <path d="M20,50 L80,50 L100,20 L120,50 L180,50 L100,60 Z" fill="currentColor" />
                    </svg>
                    <span className="text-[10px] mt-4 font-mono tracking-widest text-[#22d3ee]/60 uppercase">EO/IR Payload: TB2-G2-L3</span>
                  </div>
                </div>
             </div>

             {/* HUD OVERLAY */}
             <HUDOverlay />
          </div>
        </div>

        {/* BLOCK D: RIGHT COLUMN (Motor & Sensors) */}
        <div className="col-span-12 lg:col-span-3 xl:col-span-2 flex flex-col gap-2 min-h-0 overflow-y-auto pl-1">
          <div className="glass-card p-3 border-drone-accent/20 h-full">
            <h3 className="text-[10px] font-bold text-drone-accent uppercase mb-4 tracking-widest">Motor & Datchiklar</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {motors.map((m, i) => (
                <div key={i} className="flex flex-col items-center">
                  <CircularGauge 
                    value={m.rpm} 
                    min={0} 
                    max={8000} 
                    label="RPM" 
                    title={`MOTOR ${i+1}`} 
                    size={80}
                  />
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[9px] text-drone-text-dim">TEMP:</span>
                    <span className={`text-[10px] font-mono ${m.temp > 60 ? 'text-drone-danger font-bold' : 'text-drone-success'}`}>
                      {m.temp}°C
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-4">
               {/* ESC & Voltage Status */}
               <div className="p-2 border border-drone-border bg-black/20 rounded">
                  <div className="flex justify-between text-[9px] mb-1">
                    <span className="text-drone-text-dim uppercase">ESC TEMP:</span>
                    <span className="text-drone-accent font-bold">{esc.temp}°C</span>
                  </div>
                  <div className="w-full bg-drone-border h-1 rounded-full overflow-hidden">
                    <div className="bg-drone-accent h-full shadow-[0_0_8px_rgba(34,211,238,0.5)]" style={{ width: `${(esc.temp / 80) * 100}%` }}></div>
                  </div>
               </div>

               <div className="p-2 border border-drone-border bg-black/20 rounded">
                  <div className="flex justify-between text-[9px] mb-1">
                    <span className="text-drone-text-dim uppercase">PAYLOAD V:</span>
                    <span className="text-drone-success font-bold">{esc.voltage}V</span>
                  </div>
                  <div className="w-full bg-drone-border h-1 rounded-full overflow-hidden">
                    <div className="bg-drone-success h-full" style={{ width: `${(esc.voltage / 16.8) * 100}%` }}></div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* BLOCK E: LOWER SECTION (Map & Logs Split) */}
      <div className="h-[25vh] grid grid-cols-12 gap-2">
        <div className="col-span-12 lg:col-span-8 flex flex-col min-h-0 bg-drone-surface border border-drone-border rounded-lg relative overflow-hidden group">
           <div className="absolute top-2 right-4 z-10 flex gap-2">
              <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded border border-white/20">MAP VIEW - 1:25000</span>
           </div>
           <MapView />
        </div>
        
        <div className="col-span-12 lg:col-span-4 min-h-0">
           <SystemLogs />
        </div>
      </div>
    </div>
  );
}

