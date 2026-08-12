import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMemo, useRef } from "react";

function ParticleField() {
  const groupRef = useRef<THREE.Group | null>(null);

  const particles = useMemo(() => {
    const positions: THREE.Vector3[] = [];

    for (let i = 0; i < 180; i++) {
      positions.push(
        new THREE.Vector3(
          THREE.MathUtils.randFloatSpread(24),
          THREE.MathUtils.randFloatSpread(16),
          THREE.MathUtils.randFloatSpread(18)
        )
      );
    }

    return positions;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    groupRef.current.rotation.y =
      Math.sin(time * 0.08) * 0.08;

    groupRef.current.rotation.x =
      Math.cos(time * 0.06) * 0.035;
  });

  return (
    <group ref={groupRef}>
      {particles.map((position, index) => (
        <mesh
          key={index}
          position={[
            position.x,
            position.y,
            position.z,
          ]}
        >
          <sphereGeometry
            args={[
              THREE.MathUtils.randFloat(0.012, 0.035),
              6,
              6,
            ]}
          />

          <meshBasicMaterial
            color={
              index % 3 === 0
                ? "#7c3aed"
                : "#06b6d4"
            }
            transparent
            opacity={THREE.MathUtils.randFloat(
              0.25,
              0.7
            )}
          />
        </mesh>
      ))}
    </group>
  );
}

function FloatingRing({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  const ringRef =
    useRef<THREE.Mesh | null>(null);

  useFrame((state) => {
    if (!ringRef.current) return;

    const time =
      state.clock.getElapsedTime();

    ringRef.current.rotation.x =
      time * 0.18;

    ringRef.current.rotation.y =
      time * 0.25;

    ringRef.current.position.y =
      position[1] +
      Math.sin(time * 0.7 + position[0]) *
        0.18;
  });

  return (
    <mesh
      ref={ringRef}
      position={position}
      scale={scale}
    >
      <torusGeometry
        args={[1, 0.018, 12, 64]}
      />

      <meshBasicMaterial
        color="#7c3aed"
        transparent
        opacity={0.35}
      />
    </mesh>
  );
}

function FloatingCube({
  position,
}: {
  position: [number, number, number];
}) {
  const cubeRef =
    useRef<THREE.Mesh | null>(null);

  useFrame((state) => {
    if (!cubeRef.current) return;

    const time =
      state.clock.getElapsedTime();

    cubeRef.current.rotation.x =
      time * 0.18;

    cubeRef.current.rotation.y =
      time * 0.24;

    cubeRef.current.position.y =
      position[1] +
      Math.sin(time * 0.8) * 0.25;
  });

  return (
    <mesh
      ref={cubeRef}
      position={position}
    >
      <boxGeometry
        args={[0.65, 0.65, 0.65]}
      />

      <meshStandardMaterial
        color="#151b32"
        metalness={0.8}
        roughness={0.25}
        emissive="#4c1d95"
        emissiveIntensity={0.25}
      />
    </mesh>
  );
}

function World() {
  const worldRef =
    useRef<THREE.Group | null>(null);

  useFrame((state) => {
    if (!worldRef.current) return;

    const time =
      state.clock.getElapsedTime();

    worldRef.current.rotation.y =
      Math.sin(time * 0.08) * 0.025;
  });

  return (
    <group ref={worldRef}>
      <ParticleField />

      <FloatingRing
        position={[-5, 2.5, -2]}
        scale={1.4}
      />

      <FloatingRing
        position={[5, -2, -4]}
        scale={0.8}
      />

      <FloatingRing
        position={[4, 3.5, -7]}
        scale={0.55}
      />

      <FloatingCube
        position={[-4, -2, -3]}
      />

      <FloatingCube
        position={[4.5, 1.5, -5]}
      />

      <FloatingCube
        position={[-5, 3.5, -7]}
      />
    </group>
  );
}

export default function ThreeDBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 0,
      }}
    >
      <Canvas
        camera={{
          position: [0, 0, 10],
          fov: 55,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
        }}
      >
        <ambientLight intensity={0.45} />

        <pointLight
          position={[4, 4, 6]}
          intensity={8}
          color="#7c3aed"
        />

        <pointLight
          position={[-4, -2, 4]}
          intensity={6}
          color="#06b6d4"
        />

        <fog
          attach="fog"
          args={[
            "#080c18",
            8,
            28,
          ]}
        />

        <World />
      </Canvas>
    </div>
  );
}