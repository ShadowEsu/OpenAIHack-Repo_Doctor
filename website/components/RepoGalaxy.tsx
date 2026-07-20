"use client";

import { Line } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Group } from "three";

const clockDeprecationWarning = "THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.";
const clockWarningFilterKey = "__repoDoctorThreeClockWarningFilterInstalled__";

if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  const browserWindow = window as typeof window & Record<string, boolean | undefined>;

  if (!browserWindow[clockWarningFilterKey]) {
    const originalWarn = console.warn.bind(console);

    console.warn = (...args: unknown[]) => {
      if (args.some((argument) => argument === clockDeprecationWarning)) return;

      originalWarn(...args);
    };

    browserWindow[clockWarningFilterKey] = true;
  }
}

type Vector3 = [number, number, number];
type Severity = "critical" | "warning" | "success" | "accent";

type RepoNode = {
  color: string;
  position: Vector3;
  radius: number;
  severity: Severity;
};

const colors = {
  accent: "#1AC0AD",
  accentSecondary: "#0E6B60",
  critical: "#FF5C5C",
  success: "#3DDC97",
  warning: "#FFB020",
} as const;

const edges: Array<[number, number]> = [
  [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [3, 7], [4, 7],
  [4, 8], [5, 9], [6, 10], [7, 11], [8, 12], [9, 13], [10, 14],
  [11, 15], [12, 16], [13, 17], [14, 18], [15, 19], [16, 19], [3, 12],
  [6, 15], [10, 17],
];

const criticalNodes = new Set([0, 11, 17]);
const warningNodes = new Set([2, 5, 9, 14, 18]);
const accentNodes = new Set([7, 12]);

function vectorLength(vector: Vector3) {
  return Math.hypot(vector[0], vector[1], vector[2]);
}

function buildNodes(): RepoNode[] {
  const positions: Vector3[] = Array.from({ length: 20 }, (_, index) => {
    const angle = index * 2.399963229728653;
    const radius = 0.45 + ((index * 17) % 10) / 16;

    return [
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * 0.78,
      ((index * 7) % 9 - 4) * 0.15,
    ];
  });

  // A bounded, one-time spring settle keeps the graph naturally spaced without
  // running a force simulation during rendering.
  for (let iteration = 0; iteration < 90; iteration += 1) {
    const forces = positions.map((): Vector3 => [0, 0, 0]);

    for (let from = 0; from < positions.length; from += 1) {
      for (let to = from + 1; to < positions.length; to += 1) {
        const delta: Vector3 = [
          positions[from][0] - positions[to][0],
          positions[from][1] - positions[to][1],
          positions[from][2] - positions[to][2],
        ];
        const distance = Math.max(vectorLength(delta), 0.08);
        const strength = 0.008 / (distance * distance);

        for (let axis = 0; axis < 3; axis += 1) {
          const impulse = (delta[axis] / distance) * strength;
          forces[from][axis] += impulse;
          forces[to][axis] -= impulse;
        }
      }
    }

    for (const [from, to] of edges) {
      const delta: Vector3 = [
        positions[to][0] - positions[from][0],
        positions[to][1] - positions[from][1],
        positions[to][2] - positions[from][2],
      ];
      const distance = Math.max(vectorLength(delta), 0.08);
      const strength = (distance - 0.72) * 0.026;

      for (let axis = 0; axis < 3; axis += 1) {
        const impulse = (delta[axis] / distance) * strength;
        forces[from][axis] += impulse;
        forces[to][axis] -= impulse;
      }
    }

    positions.forEach((position, index) => {
      for (let axis = 0; axis < 3; axis += 1) {
        position[axis] += forces[index][axis] * 0.55 - position[axis] * 0.006;
      }
    });
  }

  return positions.map((position, index) => {
    const severity: Severity = criticalNodes.has(index)
      ? "critical"
      : warningNodes.has(index)
        ? "warning"
        : accentNodes.has(index)
          ? "accent"
          : "success";

    return {
      color: colors[severity],
      position,
      radius: 0.042 + ((index * 13) % 5) * 0.01 + (severity === "critical" ? 0.014 : 0),
      severity,
    };
  });
}

const nodes = buildNodes();

function GalaxyScene() {
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;

    group.current.rotation.y += delta * 0.1;
    group.current.rotation.x = Math.PI / 6 + Math.sin(state.clock.elapsedTime * 0.16) * 0.08;
  });

  return (
    <group ref={group} scale={0.9}>
      {edges.map(([from, to]) => (
        <Line
          key={`${from}-${to}`}
          color={colors.accentSecondary}
          lineWidth={0.7}
          opacity={0.56}
          points={[nodes[from].position, nodes[to].position]}
          transparent
        />
      ))}

      {nodes.map((node, index) => (
        <mesh key={index} position={node.position}>
          <sphereGeometry args={[node.radius, 12, 12]} />
          <meshStandardMaterial
            color={node.color}
            emissive={node.color}
            emissiveIntensity={node.severity === "critical" ? 1.45 : 1}
            roughness={0.38}
          />
        </mesh>
      ))}
    </group>
  );
}

export function RepoGalaxy() {
  const reduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  if (reduceMotion || !isDesktop) return null;

  return (
    <Canvas
      camera={{ fov: 42, position: [0, 0, 4.25] }}
      dpr={[1, 1.25]}
      gl={{ alpha: true, antialias: true }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      style={{ height: "100%", pointerEvents: "none", width: "100%" }}
    >
      <ambientLight intensity={0.9} />
      <pointLight color={colors.accent} intensity={3.2} position={[1.7, 1.4, 2.5]} />
      <pointLight color={colors.accentSecondary} intensity={1.6} position={[-1.5, -1, 1.5]} />
      <GalaxyScene />
    </Canvas>
  );
}
