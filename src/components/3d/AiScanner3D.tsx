import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface AiScannerMeshProps {
  riskScore: number;
}

function AiScannerMesh({ riskScore }: AiScannerMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const ring1Ref = useRef<THREE.Group>(null!);
  const ring2Ref = useRef<THREE.Group>(null!);

  const getRiskHex = (score: number) => {
    if (score >= 75) return '#dc2626';
    if (score >= 50) return '#ea580c';
    if (score >= 25) return '#d97706';
    return '#16a34a';
  };

  const color = getRiskHex(riskScore);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
      meshRef.current.rotation.x += delta * 0.2;
    }
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.6;
    if (ring2Ref.current) ring2Ref.current.rotation.x -= delta * 0.5;
  });

  return (
    <group>
      {/* Central Diagnostic Orb */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.3, 2]} />
        <MeshWobbleMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          wireframe
          factor={0.4}
          speed={2}
        />
      </mesh>

      {/* Rotating Scanner Torus 1 */}
      <group ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
        <mesh>
          <torusGeometry args={[2.1, 0.04, 16, 80]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
        </mesh>
      </group>

      {/* Rotating Scanner Torus 2 */}
      <group ref={ring2Ref} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
        <mesh>
          <torusGeometry args={[2.7, 0.03, 16, 80]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.8} />
        </mesh>
      </group>
    </group>
  );
}

interface AiScanner3DProps {
  riskScore: number;
  height?: string;
}

export const AiScanner3D: React.FC<AiScanner3DProps> = ({ riskScore, height = '220px' }) => {
  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 7.5], fov: 45 }}>
        <ambientLight intensity={1.2} />
        <pointLight position={[5, 5, 5]} intensity={3} color="#0ea5e9" />
        <AiScannerMesh riskScore={riskScore} />
      </Canvas>
    </div>
  );
};
