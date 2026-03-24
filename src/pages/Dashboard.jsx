import ArtificialHorizon from '../components/dashboard/ArtificialHorizon';
import TelemetryCards from '../components/dashboard/TelemetryCards';
import SignalIndicators from '../components/dashboard/SignalIndicators';
import BatteryGauge from '../components/dashboard/BatteryGauge';
import GPSStatus from '../components/dashboard/GPSStatus';
import EmergencyPanel from '../components/safety/EmergencyPanel';

export default function Dashboard() {
  return (
    <div className="h-full w-full p-4 overflow-y-auto custom-scrollbar">
      <div className="grid grid-cols-12 gap-4 auto-rows-min">
        {/* Row 1: HUD and Main Telemetry */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          <div className="h-[400px] xl:h-[500px]">
            <ArtificialHorizon />
          </div>
          <SignalIndicators />
        </div>

        {/* Right Sidebar: Battery, GPS, Controls */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <BatteryGauge />
          <GPSStatus />
          <EmergencyPanel />
        </div>

        {/* Row 2: Detailed Telemetry Cards */}
        <div className="col-span-12">
          <TelemetryCards />
        </div>
      </div>
    </div>
  );
}
