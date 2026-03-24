import { useEffect, useRef } from 'react';
import useDroneStore from '../store/useDroneStore';
import TelemetrySimulator from '../utils/telemetrySimulator';

export default function useSimulator() {
  const simulatorRef = useRef(null);
  const updateTelemetry = useDroneStore((s) => s.updateTelemetry);
  const setConnected = useDroneStore((s) => s.setConnected);
  const setArmed = useDroneStore((s) => s.setArmed);
  const setHome = useDroneStore((s) => s.setHome);
  
  // Use a selector to avoid unnecessary re-renders of the effect, 
  // but we need to watch for mission changes.
  const mission = useDroneStore((s) => s.mission);

  useEffect(() => {
    const sim = new TelemetrySimulator();
    simulatorRef.current = sim;

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

  // Sync simulator target with mission waypoints
  useEffect(() => {
    if (simulatorRef.current && mission.missionActive && mission.waypoints.length > 0) {
      // Fly to the first waypoint for now. 
      // This fulfills the user's "go to selected point" request.
      const target = mission.waypoints[0];
      simulatorRef.current.setTarget(target);
    } else if (simulatorRef.current) {
      simulatorRef.current.setTarget(null);
    }
  }, [mission.missionActive, mission.waypoints]);

  return simulatorRef;
}
