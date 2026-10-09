import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function FloatingNetworkNodes() {
  const groupRef = useRef<THREE.Group>(null!);
  const count = 18;

  const nodePositions = React.useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      arr.push([
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10,
      ]);
    }
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {nodePositions.map((pos, i) => (
        <Float key={i} speed={1.5} rotationIntensity={0.2} floatIntensity={0.8}>
          <mesh position={pos}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? '#0ea5e9' : i % 3 === 1 ? '#16a34a' : '#ea580c'}
              emissive={i % 3 === 0 ? '#0ea5e9' : i % 3 === 1 ? '#16a34a' : '#ea580c'}
              emissiveIntensity={0.8}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

interface PatientNetwork3DProps {
  height?: string;
  opacity?: number;
}

export const PatientNetwork3D: React.FC<PatientNetwork3DProps> = ({
  height = '100%',
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <Canvas camera={{ position: [0, 0, 16], fov: 45 }}>
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#0ea5e9" />
        <FloatingNetworkNodes />
      </Canvas>
    </div>
  );
};
