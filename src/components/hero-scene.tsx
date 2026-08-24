"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function CodeCore() {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.12;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.15;
    }
    if (core.current) {
      core.current.rotation.y = state.clock.elapsedTime * -0.2;
    }
  });

  return (
    <group ref={group}>
      <mesh ref={core}>
        <icosahedronGeometry args={[1.6, 1]} />
        <meshBasicMaterial color="#63f2c0" wireframe transparent opacity={0.55} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[1.1, 0]} />
        <meshBasicMaterial color="#a78bfa" wireframe transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function generateParticlePositions(count: number): Float32Array {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 3.2 + Math.random() * 2.2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    arr[i * 3 + 2] = r * Math.cos(phi);
  }
  return arr;
}

function Particles() {
  const points = useRef<THREE.Points>(null);
  // Randomized once on mount (a side effect, not derived during render) so the
  // component body stays a pure function of its props/state.
  const [positions] = useState(() => generateParticlePositions(260));

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#63f2c0" size={0.03} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

export function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 1.5]} gl={{ alpha: true }}>
      <CodeCore />
      <Particles />
    </Canvas>
  );
}
