import { useEffect, useState, memo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { shallow } from 'zustand/shallow';
import useDroneStore from '../store/useDroneStore';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const droneIcon = new L.DivIcon({
  className: 'custom-drone-icon',
  html: `
    <div class="relative w-8 h-8 flex items-center justify-center" id="drone-marker-inner">
      <svg viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="2.5" class="w-full h-full drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Component to handle map center updates
const MapController = memo(({ followDrone }) => {
  const map = useMap();
  const position = useDroneStore((s) => s.position, shallow);
  
  useEffect(() => {
    if (followDrone && position.lat && position.lng) {
      // Use setView with animate: false for ZERO LAG. 
      // panTo with animations was causing the 1000ms INP bottleneck.
      map.setView([position.lat, position.lng], map.getZoom(), { animate: false });
    }
  }, [position.lat, position.lng, followDrone, map]);
  
  return null;
});

// Component to handle map clicks for coordinate selection
const MapClickHandler = memo(() => {
  const setSelectedPoint = useDroneStore((s) => s.setSelectedPoint);
  useMapEvents({
    click: (e) => {
      setSelectedPoint(e.latlng);
    },
  });
  return null;
});

const DroneMarker = memo(() => {
  const position = useDroneStore((s) => s.position, shallow);
  const heading = useDroneStore((s) => s.attitude.heading);

  useEffect(() => {
    const el = document.getElementById('drone-marker-inner');
    if (el) {
      el.style.transform = `rotate(${heading}deg)`;
    }
  }, [heading]);

  return <Marker position={[position.lat, position.lng]} icon={droneIcon} />;
});

const SelectionMarker = memo(() => {
  const selectedPoint = useDroneStore((s) => s.selectedPoint, shallow);
  if (!selectedPoint) return null;
  return <Marker position={[selectedPoint.lat, selectedPoint.lng]} />;
});

const FlightPath = memo(() => {
  const [path, setPath] = useState([]);
  const lastUpdateRef = useRef(0);
  const position = useDroneStore((s) => s.position, shallow);

  useEffect(() => {
    const now = Date.now();
    if (position.lat && position.lng && (now - lastUpdateRef.current > 1000)) {
      lastUpdateRef.current = now;
      const frameId = requestAnimationFrame(() => {
        setPath((prev) => {
          const last = prev[prev.length - 1];
          if (!last) return [[position.lat, position.lng]];
          const dist = Math.sqrt(Math.pow(position.lat - last[0], 2) + Math.pow(position.lng - last[1], 2));
          if (dist > 0.00005) return [...prev, [position.lat, position.lng]].slice(-500);
          return prev;
        });
      });
      return () => cancelAnimationFrame(frameId);
    }
  }, [position.lat, position.lng]);

  return <Polyline positions={path} pathOptions={{ color: '#22d3ee', weight: 2, opacity: 0.6, dashArray: '5, 5' }} />;
});

const MapOverlay = memo(() => {
  const position = useDroneStore((s) => s.position, shallow);
  const selectedPoint = useDroneStore((s) => s.selectedPoint, shallow);
  const setSelectedPoint = useDroneStore((s) => s.setSelectedPoint);
  const addWaypoint = useDroneStore((s) => s.addWaypoint);

  return (
    <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2 pointer-events-none">
      <div className="glass-card p-3 flex flex-col gap-1 pointer-events-auto">
        <span className="text-[10px] text-drone-text-dim uppercase font-bold tracking-widest">Koordinatalar</span>
        <div className="flex gap-4">
          <div>
            <span className="text-[9px] text-drone-accent uppercase block">KENG.</span>
            <span className="text-xs font-mono text-drone-text">{position.lat.toFixed(7)}°</span>
          </div>
          <div>
            <span className="text-[9px] text-drone-accent uppercase block">UZUN.</span>
            <span className="text-xs font-mono text-drone-text">{position.lng.toFixed(7)}°</span>
          </div>
        </div>
      </div>

      {selectedPoint && (
        <div className="glass-card p-3 border-drone-accent animate-slide-in flex flex-col gap-3 pointer-events-auto">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-drone-accent uppercase font-bold tracking-widest">Tanlangan nuqta</span>
            <button onClick={() => setSelectedPoint(null)} className="text-drone-text-dim hover:text-drone-danger">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex gap-4">
            <div>
              <span className="text-[9px] text-drone-text-dim uppercase block">LAT</span>
              <span className="text-xs font-mono text-drone-text">{selectedPoint.lat.toFixed(6)}</span>
            </div>
            <div>
              <span className="text-[9px] text-drone-text-dim uppercase block">LNG</span>
              <span className="text-xs font-mono text-drone-text">{selectedPoint.lng.toFixed(6)}</span>
            </div>
          </div>
          <button
            onClick={() => {
              addWaypoint({ lat: selectedPoint.lat, lng: selectedPoint.lng, alt: 50 });
              setSelectedPoint(null);
            }}
            className="w-full py-2 bg-drone-accent text-drone-bg text-[10px] font-bold uppercase rounded-lg hover:brightness-110 active:scale-95 transition-all"
          >
            Nuqta qoʻshish
          </button>
        </div>
      )}
    </div>
  );
});

const MapView = memo(() => {
  const [followDrone, setFollowDrone] = useState(true);

  return (
    <div className="h-full w-full relative bg-drone-bg">
      <MapContainer
        center={[41.311081, 69.240562]} 
        zoom={16}
        className="h-full w-full"
        zoomControl={false}
        preferCanvas={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <MapController followDrone={followDrone} />
        <MapClickHandler />
        <FlightPath />
        <DroneMarker />
        <SelectionMarker />
      </MapContainer>

      <MapOverlay />

      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
        <button 
          onClick={() => setFollowDrone(!followDrone)}
          className={`w-12 h-12 glass-card flex items-center justify-center transition-all duration-300 ${
            followDrone ? 'text-drone-accent border-drone-accent' : 'text-drone-text-dim'
          }`}
          title={followDrone ? "Avto-kuzatish: YOQILGAN" : "Avto-kuzatish: O'CHIRILGAN"}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            {followDrone && <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" className="animate-ping opacity-20" />}
          </svg>
        </button>
        
        <div className="flex flex-col gap-1 bg-drone-bg/80 backdrop-blur-sm p-1 rounded-xl border border-drone-border">
          <button className="w-10 h-10 flex items-center justify-center text-drone-text hover:text-drone-accent transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button className="w-10 h-10 flex items-center justify-center text-drone-text hover:text-drone-accent transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});

export default MapView;
