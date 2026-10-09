import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface AiCoreCanvasProps {
  interactive?: boolean;
  onNodeClick?: (nodeId: string) => void;
  height?: string;
}

export const AiCoreCanvas: React.FC<AiCoreCanvasProps> = ({
  interactive = true,
  height = '500px',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const currentHeight = container.clientHeight || 500;

    // 1. Scene Setup
    const scene = new THREE.Scene();

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / currentHeight, 0.1, 1000);
    camera.position.set(0, 0, 14);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, currentHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 4. Lighting System
    const ambientLight = new THREE.AmbientLight(0x07111f, 1.5);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0x0ea5e9, 4, 30);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    const cyanGlowLight = new THREE.PointLight(0x38bdf8, 6, 20);
    cyanGlowLight.position.set(0, 0, 0);
    scene.add(cyanGlowLight);

    const violetLight = new THREE.PointLight(0x8b5cf6, 3, 25);
    violetLight.position.set(-5, -5, 3);
    scene.add(violetLight);

    // 5. AI Nucleus (Central 3D Sphere & Medical Symbol)
    const nucleusGroup = new THREE.Group();
    scene.add(nucleusGroup);

    // Outer wireframe orb
    const outerGeo = new THREE.IcosahedronGeometry(2.2, 3);
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    nucleusGroup.add(outerMesh);

    // Inner solid core
    const coreGeo = new THREE.IcosahedronGeometry(1.4, 2);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    nucleusGroup.add(coreMesh);

    // 6. Concentric 3D Torus Orbital Rings
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    const ringConfigs = [
      { radius: 3.2, tube: 0.03, color: 0x38bdf8, rx: Math.PI / 4, ry: Math.PI / 6, opacity: 0.8 },
      { radius: 4.1, tube: 0.025, color: 0x0ea5e9, rx: -Math.PI / 3, ry: Math.PI / 4, opacity: 0.7 },
      { radius: 5.0, tube: 0.02, color: 0x8b5cf6, rx: Math.PI / 2, ry: -Math.PI / 8, opacity: 0.6 },
    ];

    const rings: THREE.Mesh[] = [];

    ringConfigs.forEach((cfg) => {
      const rGeo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 100);
      const rMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        emissive: cfg.color,
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: cfg.opacity,
      });
      const rMesh = new THREE.Mesh(rGeo, rMat);
      rMesh.rotation.x = cfg.rx;
      rMesh.rotation.y = cfg.ry;
      ringGroup.add(rMesh);
      rings.push(rMesh);
    });

    // 7. Orbiting Data Nodes
    const nodeCount = 8;
    const nodesGroup = new THREE.Group();
    scene.add(nodesGroup);

    const nodeMeshes: { mesh: THREE.Mesh; radius: number; speed: number; angle: number; axis: THREE.Vector3 }[] = [];
    const nodeColors = [0x38bdf8, 0x0ea5e9, 0x16a34a, 0xea580c, 0x8b5cf6, 0x38bdf8, 0x0284c7, 0xd97706];

    for (let i = 0; i < nodeCount; i++) {
      const nGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const nMat = new THREE.MeshStandardMaterial({
        color: nodeColors[i % nodeColors.length],
        emissive: nodeColors[i % nodeColors.length],
        emissiveIntensity: 0.9,
        roughness: 0.1,
      });
      const nMesh = new THREE.Mesh(nGeo, nMat);

      const orbitRadius = 3.2 + (i % 3) * 0.9;
      const angle = (i / nodeCount) * Math.PI * 2;
      const speed = 0.008 + (i % 4) * 0.003;
      const axis = new THREE.Vector3(
        Math.sin(i * 1.2),
        Math.cos(i * 0.8),
        Math.sin(i * 0.5)
      ).normalize();

      nMesh.position.set(Math.cos(angle) * orbitRadius, Math.sin(angle) * orbitRadius, (i % 2 === 0 ? 1 : -1) * 0.5);
      nodesGroup.add(nMesh);

      nodeMeshes.push({ mesh: nMesh, radius: orbitRadius, speed, angle, axis });
    }

    // 8. Dynamic 3D Connecting Lines between Nodes & Nucleus
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.3,
    });

    const lines: THREE.Line[] = [];
    nodeMeshes.forEach((node) => {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        node.mesh.position.clone(),
      ]);
      const line = new THREE.Line(geometry, lineMaterial);
      scene.add(line);
      lines.push(line);
    });

    // 9. Particle Starfield / Medical Telemetry Stream
    const particleCount = 1200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 30;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      particleScales[i] = Math.random() * 0.08 + 0.02;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 10. Mouse Interaction Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      targetMouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetMouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 11. Animation Loop (60 FPS)
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera parallax
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      camera.position.x = mouseX * 2;
      camera.position.y = mouseY * 2;
      camera.lookAt(0, 0, 0);

      // Rotate AI Nucleus
      outerMesh.rotation.y = elapsedTime * 0.25;
      outerMesh.rotation.x = elapsedTime * 0.15;

      coreMesh.rotation.y = -elapsedTime * 0.4;
      coreMesh.rotation.z = elapsedTime * 0.2;

      // Rotate Rings
      rings.forEach((ring, idx) => {
        const factor = (idx + 1) * 0.2;
        ring.rotation.z = elapsedTime * factor;
        ring.rotation.y += Math.sin(elapsedTime * 0.5) * 0.002;
      });

      // Animate Orbiting Nodes & Lines
      nodeMeshes.forEach((node, idx) => {
        node.angle += node.speed;
        const x = Math.cos(node.angle) * node.radius;
        const y = Math.sin(node.angle) * node.radius;
        const z = Math.sin(node.angle * 2) * 0.8;

        node.mesh.position.set(x, y, z);

        // Update line geometry
        if (lines[idx]) {
          const positions = lines[idx].geometry.attributes.position as THREE.BufferAttribute;
          positions.setXYZ(1, x, y, z);
          positions.needsUpdate = true;
        }
      });

      // Rotate Particles
      particles.rotation.y = elapsedTime * 0.03;
      particles.rotation.x = elapsedTime * 0.015;

      renderer.render(scene, camera);
    };

    animate();

    // 12. Responsive Resize
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 500;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive]);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: height,
        position: 'relative',
        overflow: 'hidden',
      }}
    />
  );
};
