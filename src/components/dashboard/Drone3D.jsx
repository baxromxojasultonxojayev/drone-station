import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useDroneStore from '../../store/useDroneStore';
import Explosion3D from './Explosion3D';

function DeltaWingModel() {
  const meshRef = useRef();
  
  const wingGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.4);
    shape.lineTo(0.45, -0.4);
    shape.lineTo(0, -0.3);
    shape.lineTo(-0.45, -0.4);
    shape.lineTo(0, 0.4);
    
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.06,
      bevelEnabled: true, 
      bevelThickness: 0.02,
      bevelSize: 0.02,
    });
    
    // Rotate geometry once so it stays horizontal on XZ plane
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, []);

  const finGeometry = useMemo(() => new THREE.BoxGeometry(0.02, 0.18, 0.22), []);

  useFrame(() => {
    if (!meshRef.current) return;
    const { attitude } = useDroneStore.getState();
    const toRad = Math.PI / 180;
    
    // Smooth orientation (0 pitch = perfectly horizontal)
    meshRef.current.rotation.x = -attitude.pitch * toRad;
    meshRef.current.rotation.z = -attitude.roll * toRad;
    meshRef.current.rotation.y = -attitude.heading * toRad;
  });

  return (
    <group ref={meshRef}>
      {/* Tactical Highlight Outline */}
      <mesh scale={[1.1, 1.1, 1.1]} geometry={wingGeometry}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} side={THREE.BackSide} />
      </mesh>

      {/* Main Body - Tactical Silver Finish */}
      <mesh geometry={wingGeometry}>
        <meshStandardMaterial 
          color="#e5e7eb" 
          roughness={0.15} 
          metalness={0.8}
        />
      </mesh>
      
      {/* Fins */}
      <mesh position={[0.4, 0.08, -0.3]} geometry={finGeometry}>
        <meshStandardMaterial color="#4b5563" />
      </mesh>
      <mesh position={[-0.4, 0.08, -0.3]} geometry={finGeometry}>
        <meshStandardMaterial color="#4b5563" />
      </mesh>

      {/* Navigation Lights (Red/Green) */}
      <mesh position={[0.45, 0, -0.35]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>
      <mesh position={[-0.45, 0, -0.35]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>

      <pointLight position={[0, 1, 0.5]} intensity={10} color="#ffffff" />
    </group>
  );
}

export default function Drone3D() {
  const isExploded = useDroneStore((s) => s.isExploded);

  return (
    <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
      <Canvas
        shadows={false}
        orthographic
        camera={{ zoom: 80, position: [0, 5, 0], up: [0, 0, -1] }}
        gl={{ alpha: true, antialias: true, stencil: false, depth: true }}
        dpr={[1, 2]}
        frameloop={isExploded ? "always" : "demand"}
      >
        <ambientLight intensity={4} />
        {isExploded ? <Explosion3D count={250} /> : <DeltaWingModel />}
      </Canvas>
    </div>
  );
}
