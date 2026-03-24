import { useEffect, useState, memo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
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
    <div class="relative w-8 h-8 flex items-center justify-center transition-transform duration-300" id="drone-marker-inner">
      <svg viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="2.5" class="w-full h-full drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
      <div class="absolute -top-1 -right-1 w-2 h-2 bg-drone-danger rounded-full animate-ping"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.panTo(center, { animate: true, duration: 1 });
    }
  }, [center, map]);
  return null;
}

const MapView = memo(() => {
  const position = useDroneStore((s) => s.position, shallow);
  const attitude = useDroneStore((s) => s.attitude, shallow);
  const [path, setPath] = useState([]);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    const now = Date.now();
    if (position.lat && position.lng && (now - lastUpdateRef.current > 1000)) {
      lastUpdateRef.current = now;
      const frameId = requestAnimationFrame(() => {
        setPath((prev) => {
          const last = prev[prev.length - 1];
          if (!last) return [[position.lat, position.lng]];
          
          const dist = Math.sqrt(
            Math.pow(position.lat - last[0], 2) + 
            Math.pow(position.lng - last[1], 2)
          );
          
          if (dist > 0.00005) { // ~5 meters
            
            return [...prev, [position.lat, position.lng]].slice(-500);
          }
          return prev;
        });
      });
      return () => cancelAnimationFrame(frameId);
    }
  }, [position.lat, position.lng]);

  useEffect(() => {
    const el = document.getElementById('drone-marker-inner');
    if (el) {
      el.style.transform = `rotate(${attitude.heading}deg)`;
    }
  }, [attitude.heading]);

  return (
    <div className="h-full w-full relative bg-drone-bg">
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={16}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <MapController center={[position.lat, position.lng]} />
        <Polyline
          positions={path}
          pathOptions={{ color: '#22d3ee', weight: 2, opacity: 0.6, dashArray: '5, 5' }}
        />
        <Marker position={[position.lat, position.lng]} icon={droneIcon} />
      </MapContainer>

      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <div className="glass-card p-3 animate-fade-in flex flex-col gap-1">
          <span className="text-[10px] text-drone-text-dim uppercase font-bold tracking-widest">Coordinates</span>
          <div className="flex gap-4">
            <div>
              <span className="text-[9px] text-drone-accent uppercase block">LAT</span>
              <span className="text-xs font-mono text-drone-text">{position.lat.toFixed(7)}°</span>
            </div>
            <div>
              <span className="text-[9px] text-drone-accent uppercase block">LNG</span>
              <span className="text-xs font-mono text-drone-text">{position.lng.toFixed(7)}°</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
        <button className="w-10 h-10 glass-card flex items-center justify-center text-drone-text hover:text-drone-accent transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
});

export default MapView;
