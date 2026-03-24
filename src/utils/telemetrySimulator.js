// Telemetry Simulator - generates realistic drone telemetry data

class TelemetrySimulator {
  constructor() {
    this.time = 0;
    this.isFlying = true;
    this.homePosition = { lat: 41.311081, lng: 69.240562 };
    this.currentPosition = { ...this.homePosition };
    this.altitude = 50;
    this.heading = 0;
    this.batteryPercent = 100;
    this.missionPhase = 'cruise'; // takeoff, cruise, orbit, landing
    this.orbitAngle = 0;
    this.orbitRadius = 0.003; // ~300m radius
    this.intervalId = null;
  }

  start(callback, intervalMs = 200) {
    this.intervalId = setInterval(() => {
      this.time += intervalMs / 1000;
      const data = this.generateFrame();
      callback(data);
    }, intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  generateFrame() {
    // Simulate smooth attitude changes
    const pitch = Math.sin(this.time * 0.3) * 8 + Math.sin(this.time * 0.7) * 3;
    const roll = Math.sin(this.time * 0.2 + 1) * 12 + Math.cos(this.time * 0.5) * 4;
    const yaw = (this.heading + 360) % 360;

    // Simulate orbit flight path
    this.orbitAngle += 0.005;
    this.currentPosition.lat = this.homePosition.lat + Math.sin(this.orbitAngle) * this.orbitRadius;
    this.currentPosition.lng = this.homePosition.lng + Math.cos(this.orbitAngle) * this.orbitRadius;
    this.heading = ((this.orbitAngle * 180 / Math.PI) + 90) % 360;

    // Altitude variation
    const altVariation = Math.sin(this.time * 0.1) * 5;
    this.altitude = 50 + altVariation;

    // Battery drain
    this.batteryPercent = Math.max(15, 100 - (this.time * 0.08));

    // Ground speed
    const groundSpeed = 8 + Math.sin(this.time * 0.4) * 2;

    // GPS simulation
    const satellites = Math.floor(12 + Math.sin(this.time * 0.05) * 3);
    const hdop = 0.8 + Math.sin(this.time * 0.1) * 0.3;

    // Signal strengths (mostly stable with occasional dips)
    const rcSignal = Math.min(100, Math.max(60, 90 + Math.sin(this.time * 0.3) * 10));
    const telemetrySignal = Math.min(100, Math.max(50, 85 + Math.sin(this.time * 0.25) * 15));
    const videoSignal = Math.min(100, Math.max(40, 80 + Math.sin(this.time * 0.35) * 20));

    return {
      attitude: {
        pitch: parseFloat(pitch.toFixed(2)),
        roll: parseFloat(roll.toFixed(2)),
        yaw: parseFloat(yaw.toFixed(2)),
        heading: parseFloat(this.heading.toFixed(1)),
      },
      position: {
        lat: parseFloat(this.currentPosition.lat.toFixed(7)),
        lng: parseFloat(this.currentPosition.lng.toFixed(7)),
        alt: parseFloat(this.altitude.toFixed(1)),
        relativeAlt: parseFloat(this.altitude.toFixed(1)),
        groundSpeed: parseFloat(groundSpeed.toFixed(1)),
        airSpeed: parseFloat((groundSpeed + 1.5).toFixed(1)),
        climbRate: parseFloat((altVariation * 0.1).toFixed(2)),
      },
      battery: {
        voltage: parseFloat((3.7 * 4 * (this.batteryPercent / 100) + 2.8 * 4 * (1 - this.batteryPercent / 100)).toFixed(2)),
        current: parseFloat((12 + Math.sin(this.time * 0.5) * 3).toFixed(1)),
        percentage: Math.floor(this.batteryPercent),
        cellCount: 4,
      },
      gps: {
        satellites,
        hdop: parseFloat(hdop.toFixed(2)),
        fixType: satellites > 6 ? 3 : satellites > 3 ? 2 : 1,
      },
      signals: {
        rc: Math.floor(rcSignal),
        telemetry: Math.floor(telemetrySignal),
        video: Math.floor(videoSignal),
      },
    };
  }
}

export default TelemetrySimulator;
