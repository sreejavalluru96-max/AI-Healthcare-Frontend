import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

// 1. Central 3D AI Nucleus Component
function AiNucleus() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const innerMeshRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
    if (innerMeshRef.current) {
      innerMeshRef.current.rotation.y -= delta * 0.4;
      innerMeshRef.current.rotation.z += delta * 0.2;
    }
  });

  return (
    <group>
      {/* Outer Wobble Shield */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2.2, 3]} />
        <MeshWobbleMaterial
          color="#0ea5e9"
          wireframe
          transparent
          opacity={0.4}
          factor={0.3}
          speed={1.5}
        />
      </mesh>

      {/* Inner Glowing Nucleus Core */}
      <mesh ref={innerMeshRef}>
        <icosahedronGeometry args={[1.4, 2]} />
        <meshStandardMaterial
          color="#0284c7"
          emissive="#0ea5e9"
          emissiveIntensity={1.2}
          roughness={0.15}
          metalness={0.85}
        />
      </mesh>
    </group>
  );
}

// 2. Concentric 3D Orbital Rings Component
function OrbitalRings() {
  const ring1 = useRef<THREE.Group>(null!);
  const ring2 = useRef<THREE.Group>(null!);
  const ring3 = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    if (ring1.current) ring1.current.rotation.z += delta * 0.3;
    if (ring2.current) ring2.current.rotation.z -= delta * 0.4;
    if (ring3.current) ring3.current.rotation.x += delta * 0.25;
  });

  return (
    <group>
      {/* Ring 1 */}
      <group ref={ring1} rotation={[Math.PI / 4, Math.PI / 6, 0]}>
        <mesh>
          <torusGeometry args={[3.3, 0.035, 16, 100]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* Ring 2 */}
      <group ref={ring2} rotation={[-Math.PI / 3, Math.PI / 4, 0]}>
        <mesh>
          <torusGeometry args={[4.2, 0.028, 16, 100]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.7} />
        </mesh>
      </group>

      {/* Ring 3 */}
      <group ref={ring3} rotation={[Math.PI / 2, -Math.PI / 8, 0]}>
        <mesh>
          <torusGeometry args={[5.1, 0.022, 16, 100]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.6} />
        </mesh>
      </group>
    </group>
  );
}

// 3. Orbiting 3D Data Nodes
function OrbitingNodes() {
  const nodesRef = useRef<THREE.Group>(null!);
  const count = 8;
  const colors = ['#38bdf8', '#0ea5e9', '#16a34a', '#ea580c', '#8b5cf6', '#38bdf8', '#0284c7', '#d97706'];

  useFrame((state, delta) => {
    if (nodesRef.current) {
      nodesRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={nodesRef}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const radius = 3.6 + (i % 3) * 0.8;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(i * 1.5) * 1.2;

        return (
          <Float key={i} speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <mesh position={[x, y, z]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial
                color={colors[i % colors.length]}
                emissive={colors[i % colors.length]}
                emissiveIntensity={1.0}
              />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
}

// 4. Particle Starfield
function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null!);
  const count = 1000;

  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 35;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 35;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 35;
    }
    return pos;
  }, [count]);

  useFrame((state, delta) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#38bdf8"
        size={0.07}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// 5. Main Hero Scene Canvas Container
interface HeroScene3DProps {
  height?: string;
}

export const HeroScene3D: React.FC<HeroScene3DProps> = ({ height = '460px' }) => {
  return (
    <div style={{ width: '100%', height, position: 'relative', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 0, 13], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
        <pointLight position={[0, 0, 0]} intensity={4} color="#0ea5e9" />
        <pointLight position={[-5, -5, 5]} intensity={2} color="#8b5cf6" />

        <AiNucleus />
        <OrbitalRings />
        <OrbitingNodes />
        <ParticleField />

        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} />
      </Canvas>
    </div>
  );
};
