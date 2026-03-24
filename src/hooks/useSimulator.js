import { useEffect, useRef } from 'react';
import useDroneStore from '../store/useDroneStore';
import TelemetrySimulator from '../utils/telemetrySimulator';

export default function useSimulator() {
  const simulatorRef = useRef(null);
  const updateTelemetry = useDroneStore((s) => s.updateTelemetry);
  const setConnected = useDroneStore((s) => s.setConnected);
  const setArmed = useDroneStore((s) => s.setArmed);
  const setHome = useDroneStore((s) => s.setHome);

  useEffect(() => {
    const sim = new TelemetrySimulator();
    simulatorRef.current = sim;

    // Mark as connected via simulation
    setConnected(true, 'simulation');
    setArmed(true);
    setHome(41.311081, 69.240562, 0);

    sim.start((data) => {
      updateTelemetry(data);
    }, 200);

    return () => {
      sim.stop();
      setConnected(false, 'none');
    };
  }, []);

  return simulatorRef;
}
