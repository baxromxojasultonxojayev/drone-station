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
        // Calculate bearing and heading error
        const bearing = (Math.atan2(dLng, dLat) * 180 / Math.PI + 360) % 360;
        let headingError = bearing - this.heading;
        if (headingError > 180) headingError -= 360;
        if (headingError < -180) headingError += 360;
        
        // Priority: Turn first, move second
        const isTurning = Math.abs(headingError) > 10;
        const turnSpeed = isTurning ? 0.35 : 0.15; // Faster rotation when error is large
        this.heading += headingError * turnSpeed;

        // Linear movement speed depends on current alignment
        // If not aligned, slow down significantly to "turn in place"
        const alignmentFactor = Math.max(0, 1 - Math.abs(headingError) / 45);
        const actualStep = Math.min(this.speed, distance) * (isTurning ? 0.2 : alignmentFactor);

        this.currentPosition.lat += (dLat / distance) * actualStep;
        this.currentPosition.lng += (dLng / distance) * actualStep;

        // Lean into movement (roll) and forward (pitch)
        roll = headingError * 0.8; 
        pitch = -15 * alignmentFactor + pitchBase; 
        groundSpeed = 12 * alignmentFactor + Math.sin(this.time * 0.4) * 2;
      } else {
        // Target reached - TRIGGER EXPLOSION
        this.target = null;
        return { exploded: true };
      }
    } else {
      // HOVER BY DEFAULT instead of orbiting at start.
      // This addresses the user's question "why is it moving?"
      this.missionPhase = 'hover';
      this.currentPosition.lat += Math.sin(this.time * 0.1) * 0.000001; // Tiny idle jitter
      this.currentPosition.lng += Math.cos(this.time * 0.1) * 0.000001;
      this.heading = (this.heading + Math.sin(this.time * 0.2) * 0.5 + 360) % 360;
      groundSpeed = 0.2;
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
      motors: [
        { rpm: Math.floor(5400 + Math.sin(this.time * 2) * 200), temp: Math.floor(45 + Math.sin(this.time * 0.1) * 2) },
        { rpm: Math.floor(5440 + Math.cos(this.time * 2) * 180), temp: Math.floor(46 + Math.cos(this.time * 0.1) * 2) },
        { rpm: Math.floor(5380 + Math.sin(this.time * 2.1) * 150), temp: Math.floor(44 + Math.sin(this.time * 0.12) * 2) },
        { rpm: Math.floor(5410 + Math.cos(this.time * 1.9) * 220), temp: Math.floor(47 + Math.cos(this.time * 0.08) * 2) },
      ],
      esc: {
        temp: Math.floor(38 + Math.sin(this.time * 0.05) * 5),
        voltage: parseFloat((this.batteryPercent * 0.168).toFixed(2)),
      }
    };
  }
}

export default TelemetrySimulator;
