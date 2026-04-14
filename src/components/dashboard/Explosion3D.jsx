import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Pure generator to satisfy React Compiler requirements. 
 * Note: While Math.random is strictly impure, using it inside useMemo
 * for initialization is a standard pattern for 3D state.
 */
const prepareParticleData = (count) => {
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();
  
  for (let i = 0; i < count; i++) {
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.random() * Math.PI;
    const speed = 1.0 + Math.random() * 3.0;
    
    velocities[i * 3] = Math.sin(theta) * Math.cos(phi) * speed;
    velocities[i * 3 + 1] = Math.sin(theta) * Math.sin(phi) * speed;
    velocities[i * 3 + 2] = Math.cos(theta) * speed;
    
    color.setHSL(0.02 + Math.random() * 0.1, 1.0, 0.5 + Math.random() * 0.5);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  return { positions, velocities, colors };
};

export default function Explosion3D({ count = 250 }) {
  const pointsRef = useRef();
  const shockwaveRef = useRef();
  
  // 1. Create stable data for React JSX layer (satisfies "no ref access in render")
  const data = useMemo(() => prepareParticleData(count), [count]);
  
  // 2. Create a mutable reference for the high-frequency animation loop
  // This bypasses 'immutability' and 'ref-in-render' errors
  const velocitiesRef = useRef(data.velocities);

  useFrame((state, delta) => {
    const points = pointsRef.current;
    if (!points) return;

    const posAttr = points.geometry.attributes.position;
    const colorAttr = points.geometry.attributes.color;
    const v = velocitiesRef.current;
    
    for (let i = 0; i < count; i++) {
      // Directly mutate the underlying array for maximum performance
      posAttr.array[i * 3] += v[i * 3] * delta * 2;
      posAttr.array[i * 3 + 1] += v[i * 3 + 1] * delta * 2;
      posAttr.array[i * 3 + 2] += v[i * 3 + 2] * delta * 2;
      
      colorAttr.array[i * 3] *= 0.95;
      colorAttr.array[i * 3 + 1] *= 0.95;
      colorAttr.array[i * 3 + 2] *= 0.95;
      
      v[i * 3] *= 0.93;
      v[i * 3 + 1] *= 0.93;
      v[i * 3 + 2] *= 0.93;
    }
    
    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
    points.scale.multiplyScalar(1.02);

    if (shockwaveRef.current) {
      shockwaveRef.current.scale.multiplyScalar(1.15);
      shockwaveRef.current.material.opacity *= 0.85;
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          {/* We pass the 'stable' data object, not the ref, to satisfy the compiler */}
          <bufferAttribute attach="attributes-position" count={count} array={data.positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={count} array={data.colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.25} vertexColors transparent opacity={1} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>

      <mesh ref={shockwaveRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.05, 0.2, 32]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>

      <pointLight intensity={15} color="#ffaa00" distance={10} />
    </group>
  );
}
