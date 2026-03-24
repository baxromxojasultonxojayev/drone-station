import { create } from 'zustand';

const useDroneStore = create((set, get) => ({
  // Connection
  connected: false,
  connectionType: 'none', // 'websocket', 'serial', 'simulation'
  lastHeartbeat: null,

  // Armed & Flight mode
  armed: false,
  flightMode: 'STABILIZE',
  flightModes: ['STABILIZE', 'ALT_HOLD', 'LOITER', 'AUTO', 'RTL', 'LAND', 'GUIDED'],

  // Attitude
  attitude: {
    pitch: 0,
    roll: 0,
    yaw: 0,
    heading: 0,
  },

  // Position
  position: {
    lat: 41.311081,
    lng: 69.240562,
    alt: 0,
    relativeAlt: 0,
    groundSpeed: 0,
    airSpeed: 0,
    climbRate: 0,
  },

  // Battery
  battery: {
    voltage: 16.8,
    current: 0,
    percentage: 100,
    cellCount: 4,
  },

  // GPS
  gps: {
    satellites: 0,
    hdop: 99.99,
    fixType: 0, // 0=No, 1=No, 2=2D, 3=3D
  },

  // Signals
  signals: {
    rc: 0,
    telemetry: 0,
    video: 0,
  },

  // Home position
  home: {
    lat: 41.311081,
    lng: 69.240562,
    alt: 0,
    set: false,
  },

  // Mission
  mission: {
    waypoints: [],
    currentWaypoint: 0,
    totalWaypoints: 0,
    missionActive: false,
  },

  setIsMissionActive: (active) => set((state) => ({
    mission: { ...state.mission, missionActive: active },
  })),

  // Geofence
  geofence: {
    zones: [],
    breach: false,
  },

  // Selection
  selectedPoint: null,
 
  // Alerts
  alerts: [],

  // Actions
  updateTelemetry: (data) => set((state) => ({
    attitude: { ...state.attitude, ...data.attitude },
    position: { ...state.position, ...data.position },
    battery: { ...state.battery, ...data.battery },
    gps: { ...state.gps, ...data.gps },
    signals: { ...state.signals, ...data.signals },
    lastHeartbeat: Date.now(),
  })),

  setConnected: (status, type = 'simulation') => set({
    connected: status,
    connectionType: type,
    lastHeartbeat: status ? Date.now() : null,
  }),

  setArmed: (armed) => set({ armed }),

  setFlightMode: (mode) => set({ flightMode: mode }),

  setHome: (lat, lng, alt) => set({
    home: { lat, lng, alt, set: true },
  }),

  addWaypoint: (waypoint) => set((state) => ({
    mission: {
      ...state.mission,
      waypoints: [...state.mission.waypoints, {
        id: Date.now(),
        ...waypoint,
      }],
      totalWaypoints: state.mission.waypoints.length + 1,
    },
  })),

  removeWaypoint: (id) => set((state) => ({
    mission: {
      ...state.mission,
      waypoints: state.mission.waypoints.filter((w) => w.id !== id),
      totalWaypoints: state.mission.waypoints.length - 1,
    },
  })),

  clearMission: () => set((state) => ({
    mission: { ...state.mission, waypoints: [], currentWaypoint: 0, totalWaypoints: 0, missionActive: false },
  })),

  addGeofenceZone: (zone) => set((state) => ({
    geofence: {
      ...state.geofence,
      zones: [...state.geofence.zones, { id: Date.now(), ...zone }],
    },
  })),

  addAlert: (alert) => set((state) => ({
    alerts: [
      { id: Date.now(), timestamp: new Date().toISOString(), ...alert },
      ...state.alerts,
    ].slice(0, 50),
  })),

  clearAlerts: () => set({ alerts: [] }),

  setSelectedPoint: (point) => set({ selectedPoint: point }),

  emergencyLand: () => {
    const state = get();
    state.addAlert({ type: 'danger', message: 'EMERGENCY LANDING INITIATED' });
    set({ flightMode: 'LAND' });
  },

  returnToHome: () => {
    const state = get();
    state.addAlert({ type: 'warning', message: 'RETURN TO HOME ACTIVATED' });
    set({ flightMode: 'RTL' });
  },
}));

export default useDroneStore;
