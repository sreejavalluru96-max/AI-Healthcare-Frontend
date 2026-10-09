import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface RiskScannerCanvasProps {
  riskScore: number;
  height?: string;
}

export const RiskScannerCanvas: React.FC<RiskScannerCanvasProps> = ({
  riskScore = 0,
  height = '240px',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 240;
    const currentHeight = container.clientHeight || 240;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / currentHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, currentHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 4. Color logic based on risk score
    const getRiskColor = (score: number) => {
      if (score >= 75) return 0xdc2626; // Red
      if (score >= 50) return 0xea580c; // Orange
      if (score >= 25) return 0xd97706; // Amber
      return 0x16a34a; // Green
    };

    const targetColorHex = getRiskColor(riskScore);
    const targetColor = new THREE.Color(targetColorHex);

    // 5. Ambient & Point Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(targetColorHex, 4, 15);
    pointLight.position.set(0, 0, 4);
    scene.add(pointLight);

    // 6. Central Diagnostic Orb
    const orbGeo = new THREE.IcosahedronGeometry(1.2, 2);
    const orbMat = new THREE.MeshStandardMaterial({
      color: targetColorHex,
      emissive: targetColorHex,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: true,
    });
    const orbMesh = new THREE.Mesh(orbGeo, orbMat);
    scene.add(orbMesh);

    // 7. Rotating Scanner Ring
    const ringGeo = new THREE.TorusGeometry(2.0, 0.05, 16, 80);
    const ringMat = new THREE.MeshBasicMaterial({
      color: targetColorHex,
      wireframe: false,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    scene.add(ringMesh);

    // 8. Outer Scanning Arc Ring
    const outerRingGeo = new THREE.TorusGeometry(2.6, 0.03, 16, 80);
    const outerRingMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.8,
    });
    const outerRingMesh = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRingMesh.rotation.y = Math.PI / 4;
    scene.add(outerRingMesh);

    // 9. Particle Cloud
    const particleCount = 250;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.0 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      particlePos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePos[i * 3 + 2] = radius * Math.cos(phi);
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: targetColorHex,
      size: 0.06,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 10. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      orbMesh.rotation.y = t * 0.5;
      orbMesh.rotation.x = t * 0.3;

      ringMesh.rotation.z = t * 0.8;
      outerRingMesh.rotation.x = -t * 0.4;
      outerRingMesh.rotation.z = t * 0.2;

      particles.rotation.y = t * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 240;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [riskScore]);

  return <div ref={mountRef} style={{ width: '100%', height, position: 'relative' }} />;
};
