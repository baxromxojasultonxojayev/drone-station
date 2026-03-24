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
    this.missionPhase = 'cruise'; 
    this.orbitAngle = 0;
    this.orbitRadius = 0.003; 
    this.intervalId = null;
    this.target = null;
    this.speed = 0.00015; // Degrees per frame at 5Hz (~10m/s)
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

  setTarget(target) {
    this.target = target;
  }

  generateFrame() {
    // Simulate smooth attitude changes
    const pitchBase = Math.sin(this.time * 0.3) * 5;
    const rollBase = Math.sin(this.time * 0.2 + 1) * 8;
    
    let groundSpeed = 0;
    let pitch = pitchBase;
    let roll = rollBase;

    if (this.target) {
      // Calculate delta to target
      const dLat = this.target.lat - this.currentPosition.lat;
      const dLng = this.target.lng - this.currentPosition.lng;
      const distance = Math.sqrt(dLat * dLat + dLng * dLng);

      if (distance > 0.00005) {
        // Move towards target
        const step = Math.min(this.speed, distance);
        this.currentPosition.lat += (dLat / distance) * step;
        this.currentPosition.lng += (dLng / distance) * step;
        
        // Calculate bearing
        const bearing = (Math.atan2(dLng, dLat) * 180 / Math.PI + 360) % 360;
        
        // Smoothly rotate heading
        let diff = bearing - this.heading;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        this.heading += diff * 0.2;

        // Lean into movement
        pitch = -15 + pitchBase; // Leaning forward
        groundSpeed = 12 + Math.sin(this.time * 0.4) * 2;
      } else {
        // Target reached
        this.target = null;
        this.missionPhase = 'hover';
        groundSpeed = 0.5;
      }
    } else {
      // Orbit if no target
      this.orbitAngle += 0.005;
      this.currentPosition.lat = this.homePosition.lat + Math.sin(this.orbitAngle) * this.orbitRadius;
      this.currentPosition.lng = this.homePosition.lng + Math.cos(this.orbitAngle) * this.orbitRadius;
      this.heading = ((this.orbitAngle * 180 / Math.PI) + 90) % 360;
      groundSpeed = 8 + Math.sin(this.time * 0.4) * 2;
    }

    const yaw = (this.heading + 360) % 360;

    // Altitude variation
    const altVariation = Math.sin(this.time * 0.1) * 2;
    this.altitude = (this.target ? this.target.alt : 50) + altVariation;

    // Battery drain
    this.batteryPercent = Math.max(15, 100 - (this.time * 0.05));

    // GPS simulation
    const satellites = Math.floor(14 + Math.sin(this.time * 0.05) * 2);
    const hdop = 0.7 + Math.sin(this.time * 0.1) * 0.1;

    // Signal strengths
    const rcSignal = Math.min(100, Math.max(80, 95 + Math.sin(this.time * 0.3) * 5));
    const telemetrySignal = Math.min(100, Math.max(70, 90 + Math.sin(this.time * 0.25) * 10));
    const videoSignal = Math.min(100, Math.max(60, 85 + Math.sin(this.time * 0.35) * 15));

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
        airSpeed: parseFloat((groundSpeed + 1.2).toFixed(1)),
        climbRate: parseFloat((altVariation * 0.1).toFixed(2)),
      },
      battery: {
        voltage: parseFloat((3.7 * 4 * (this.batteryPercent / 100) + 3.2 * 4 * (1 - this.batteryPercent / 100)).toFixed(2)),
        current: parseFloat((10 + Math.sin(this.time * 0.5) * 2).toFixed(1)),
        percentage: Math.floor(this.batteryPercent),
        cellCount: 4,
      },
      gps: {
        satellites,
        hdop: parseFloat(hdop.toFixed(2)),
        fixType: 3,
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
