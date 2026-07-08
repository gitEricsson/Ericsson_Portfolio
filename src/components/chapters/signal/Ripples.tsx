"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "@/lib/useReducedMotion";

// Site rule: three blacks are 0x111114, never raw #000.
const INK = 0x111114;

export type RipplePointer = { x: number; y: number; active: boolean };

type Ring = {
  active: boolean;
  x: number;
  y: number;
  r: number;
  maxR: number;
  speed: number;
  alpha: number;
};

const POOL = 14;
const EMIT_EVERY = 1.7;
const POINTER_EMIT_EVERY = 0.5;

/**
 * FIG. 06: broadcast. Thin ink rings ripple outward from the page and from
 * the visitor's cursor: a signal, sent and answered. Deliberately calm.
 */
export default function Ripples({ pointer }: { pointer: RipplePointer }) {
  const reduced = useReducedMotion();
  const { viewport } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const clockRef = useRef({ emit: 0, pointerEmit: 0 });

  const rings = useMemo<Ring[]>(
    () =>
      Array.from({ length: POOL }, () => ({
        active: false,
        x: 0,
        y: 0,
        r: 0,
        maxR: 1,
        speed: 1,
        alpha: 0,
      })),
    []
  );

  // One unit circle shared by every ring; each ring owns only a material.
  const circleGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(a), Math.sin(a), 0));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  const lines = useMemo(
    () =>
      Array.from({ length: POOL }, () => {
        const line = new THREE.Line(
          circleGeometry,
          new THREE.LineBasicMaterial({
            color: INK,
            transparent: true,
            opacity: 0,
            depthWrite: false,
          })
        );
        line.visible = false;
        return line;
      }),
    [circleGeometry]
  );

  const spawn = (x: number, y: number, maxR: number, speed: number) => {
    const ring = rings.find((r) => !r.active);
    if (!ring) return;
    ring.active = true;
    ring.x = x;
    ring.y = y;
    ring.r = 0.15;
    ring.maxR = maxR;
    ring.speed = speed;
    ring.alpha = 1;
  };

  useFrame((_, delta) => {
    if (reduced) {
      // Static plate: three faint concentric rings, nothing moves.
      lines.forEach((line, i) => {
        const visible = i < 3;
        line.visible = visible;
        if (visible) {
          line.position.set(0, 0, 0);
          line.scale.setScalar(2.2 + i * 1.8);
          (line.material as THREE.LineBasicMaterial).opacity = 0.14 - i * 0.04;
        }
      });
      return;
    }

    const clock = clockRef.current;
    clock.emit += delta;
    clock.pointerEmit += delta;

    // Ambient pulse from a slow-wandering origin near the page center.
    if (clock.emit >= EMIT_EVERY) {
      clock.emit = 0;
      const t = performance.now() / 20000;
      spawn(
        Math.sin(t * 2.3) * viewport.width * 0.18,
        Math.cos(t * 1.7) * viewport.height * 0.14,
        Math.min(viewport.width, 24) * 0.42,
        2.6
      );
    }

    // The visitor broadcasts too: small rings trail the cursor.
    if (pointer.active && clock.pointerEmit >= POINTER_EMIT_EVERY) {
      clock.pointerEmit = 0;
      spawn(
        (pointer.x * viewport.width) / 2,
        (pointer.y * viewport.height) / 2,
        Math.min(viewport.width, 24) * 0.2,
        2.1
      );
    }

    rings.forEach((ring, i) => {
      const line = lines[i];
      if (!ring.active) {
        line.visible = false;
        return;
      }
      ring.r += ring.speed * delta;
      // Ease as it expands, like a wave losing energy.
      ring.speed = Math.max(0.5, ring.speed - delta * 0.9);
      ring.alpha = Math.max(0, 1 - ring.r / ring.maxR);
      if (ring.alpha <= 0.005) {
        ring.active = false;
        line.visible = false;
        return;
      }
      line.visible = true;
      line.position.set(ring.x, ring.y, 0);
      line.scale.setScalar(ring.r);
      (line.material as THREE.LineBasicMaterial).opacity = ring.alpha * 0.3;
    });
  });

  return (
    <group ref={groupRef}>
      {lines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </group>
  );
}
