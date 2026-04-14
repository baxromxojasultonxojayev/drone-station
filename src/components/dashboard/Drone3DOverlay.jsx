import { useState, useEffect, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import useDroneStore from '../../store/useDroneStore';
import Drone3D from './Drone3D';

/**
 * Robust Drone Overlay
 * This component renders the 3D Drone as a top-level map overlay.
 * It bypasses Leaflet's Marker system entirely for guaranteed visibility and stability.
 */
export default function Drone3DOverlay() {
  const map = useMap();
  const [pixelPos, setPixelPos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // Function to sync screen coordinates with geographic coordinates
  const updatePixelPos = useCallback(() => {
    const { position } = useDroneStore.getState();
    if (!position.lat || !position.lng) return;

    try {
      const point = map.latLngToContainerPoint([position.lat, position.lng]);
      setPixelPos({ x: Math.round(point.x), y: Math.round(point.y) });
      setIsVisible(true);
    } catch {
      // Map might not be ready
      setIsVisible(false);
    }
  }, [map]);

  // Handle high-frequency telemetry updates
  useEffect(() => {
    const unsubscribe = useDroneStore.subscribe(
      (state) => state.position,
      () => {
        // Use requestAnimationFrame for smooth pixel-perfect tracking
        requestAnimationFrame(updatePixelPos);
      },
      { fireImmediately: true }
    );
    return unsubscribe;
  }, [updatePixelPos]);

  // Handle map interactions (zoom, pan, move)
  useEffect(() => {
    map.on('move', updatePixelPos);
    map.on('zoom', updatePixelPos);
    map.on('viewreset', updatePixelPos);
    
    return () => {
      map.off('move', updatePixelPos);
      map.off('zoom', updatePixelPos);
      map.off('viewreset', updatePixelPos);
    };
  }, [map, updatePixelPos]);

  if (!isVisible) return null;

  return (
    <div
      id="drone-overlay-root"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '400px',
        height: '400px',
        transform: `translate(${pixelPos.x - 200}px, ${pixelPos.y - 200}px)`,
        zIndex: 1000,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible', // Ensure 3D effects can transcend if needed
        filter: 'drop-shadow(0 0 15px rgba(0,0,0,0.4))'
      }}
    >
      <Drone3D />
    </div>
  );
}
