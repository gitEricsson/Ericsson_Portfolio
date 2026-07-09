"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { identity } from "@/content/profile";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Shared mutable handles: Hero.tsx tweens these plain objects with GSAP,
 * the shader reads them directly as uniforms. No React state crosses the
 * canvas boundary per frame.
 */
export type HeroHandles = {
  uProgress: { value: number };
  uDissolve: { value: number };
  mouse: { x: number; y: number };
};

// Reused per frame. Never allocate inside useFrame.
const TMP = new THREE.Vector3();

const VERTEX = /* glsl */ `
  uniform float uProgress;
  uniform float uDissolve;
  uniform vec3 uMouse;
  uniform float uTime;
  uniform float uPixelRatio;
  attribute vec3 aTarget;
  attribute vec4 aRand;

  void main() {
    // Per-particle stagger: each point runs its own eased ramp inside uProgress.
    float p = clamp(uProgress * 1.6 - aRand.w * 0.6, 0.0, 1.0);
    p = 1.0 - pow(1.0 - p, 3.0);
    vec3 pos = mix(position, aTarget, p);

    // Drift while unassembled, decaying to zero as the glyphs lock.
    float un = 1.0 - p;
    pos.x += sin(uTime * (0.4 + abs(aRand.x)) + aRand.y * 6.2831) * 0.55 * un;
    pos.y += cos(uTime * (0.5 + abs(aRand.y)) + aRand.z * 6.2831) * 0.55 * un;
    pos.z += sin(uTime * (0.3 + abs(aRand.z)) + aRand.x * 6.2831) * 0.55 * un;

    // Mouse repulsion on the text plane, smooth falloff inside 1.4 world units.
    vec2 away = pos.xy - uMouse.xy;
    float d = length(away);
    pos.xy += (away / max(d, 0.001)) * smoothstep(1.4, 0.0, d) * 0.85;

    // Scroll dissolve: the name scatters back into noise.
    pos += aRand.xyz * uDissolve * 10.0;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    // Fine grain: ~1-2px at the text plane (camera z 10), mild depth
    // attenuation, clamped so near-camera strays never flash huge.
    gl_PointSize = min(
      (1.1 + abs(aRand.x) * 0.9) * uPixelRatio * (10.0 / max(-mv.z, 1.0)),
      12.0
    );
  }
`;

const FRAGMENT = /* glsl */ `
  uniform float uDissolve;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float sprite = smoothstep(0.5, 0.14, r);
    gl_FragColor = vec4(vec3(0.957), sprite * (1.0 - uDissolve * 0.95));
  }
`;

/**
 * Rasterizes "ERICSSON" / "RAPHAEL" on an offscreen 2D canvas and samples
 * filled pixels into world-space particle targets centered at the origin.
 * Returns null if the context or glyph coverage is unavailable.
 */
function sampleGlyphTargets(
  count: number,
  worldWidth: number,
  maxWorldHeight: number
): Float32Array | null {
  const fontSize = 160;
  // Tight leading between the two stacked lines.
  const lineGap = fontSize * 0.96;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  // next/font registers Archivo under a hashed family name; resolve it.
  const family = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-archivo")
    .trim();
  const stack = family
    ? `${family}, Archivo, sans-serif`
    : "Archivo, sans-serif";
  const applyFont = (c: CanvasRenderingContext2D) => {
    // Invalid family strings leave ctx.font untouched: set a fallback first.
    c.font = `900 ${fontSize}px sans-serif`;
    c.font = `900 ${fontSize}px ${stack}`;
  };

  applyFont(ctx);
  const textWidth = Math.max(
    ctx.measureText(identity.firstName).width,
    ctx.measureText(identity.lastName).width
  );
  if (textWidth <= 0) return null;

  const pad = Math.ceil(fontSize * 0.25);
  canvas.width = Math.ceil(textWidth) + pad * 2;
  canvas.height = Math.ceil(lineGap + fontSize * 1.6);
  // Resizing the canvas resets all context state, including the font.
  applyFont(ctx);
  ctx.fillStyle = "#f4f4f6";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  ctx.fillText(identity.firstName, cx, cy - lineGap / 2);
  ctx.fillText(identity.lastName, cx, cy + lineGap / 2);

  const img = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const filled: number[] = [];
  const step = 2;
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      if (img[(y * canvas.width + x) * 4 + 3] > 128) filled.push(x, y);
    }
  }
  const pool = filled.length / 2;
  if (pool === 0) return null;

  // Span ~90% of the viewport width, capped so the block never overflows height.
  const scale = Math.min(
    worldWidth / textWidth,
    maxWorldHeight / (lineGap + fontSize)
  );
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const pick = Math.floor(Math.random() * pool) * 2;
    const px = filled[pick] + (Math.random() - 0.5) * step;
    const py = filled[pick + 1] + (Math.random() - 0.5) * step;
    const j = i * 3;
    out[j] = (px - cx) * scale;
    out[j + 1] = (cy - py) * scale;
    out[j + 2] = (Math.random() - 0.5) * 0.12;
  }
  return out;
}

type Props = {
  handles: HeroHandles;
  /** Reports whether the glyphs were sampled: false triggers the DOM fallback. */
  onOutcome?: (ok: boolean) => void;
};

/** FIG. 01: thousands of points assembling into the name, dissolving on scroll. */
export default function IdentityField({ handles, onOutcome }: Props) {
  const reduced = useReducedMotion();
  const { gl, viewport, invalidate } = useThree();
  const pointsRef = useRef<THREE.Points>(null);

  const data = useMemo(() => {
    // Lighter on phones: mobile GPUs throttle heavy point clouds under
    // battery saver, which is exactly where the name used to vanish.
    const count =
      typeof window !== "undefined" && window.innerWidth < 768 ? 5000 : 15000;
    const positions = new Float32Array(count * 3);
    const targets = new Float32Array(count * 3);
    const rands = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      // Uniform sphere, radius ~9, depth flattened away from the camera plane.
      const radius = 9 * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const cosPhi = Math.random() * 2 - 1;
      const sinPhi = Math.sqrt(1 - cosPhi * cosPhi);
      const j = i * 3;
      positions[j] = radius * sinPhi * Math.cos(theta);
      positions[j + 1] = radius * sinPhi * Math.sin(theta);
      positions[j + 2] = radius * cosPhi * 0.55;
      // Targets start as the cloud itself: pre-rasterization frames stay calm.
      targets[j] = positions[j];
      targets[j + 1] = positions[j + 1];
      targets[j + 2] = positions[j + 2];
      const k = i * 4;
      rands[k] = Math.random() * 2 - 1;
      rands[k + 1] = Math.random() * 2 - 1;
      // Shallow z scatter so the dissolve never crosses the camera plane.
      rands[k + 2] = (Math.random() * 2 - 1) * 0.35;
      rands[k + 3] = Math.random();
    }
    return { count, positions, targets, rands };
  }, []);

  // R3F may clone or replace the uniforms object it receives, so shared
  // object identity with GSAP's tween targets cannot be trusted. These are
  // construction values only; useFrame syncs the live material every frame.
  const uniforms = useMemo(
    () => ({
      uProgress: { value: handles.uProgress.value },
      uDissolve: { value: handles.uDissolve.value },
      uMouse: { value: new THREE.Vector3(handles.mouse.x, handles.mouse.y, 0) },
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
    }),
    [handles]
  );

  useEffect(() => {
    const mat = pointsRef.current?.material as THREE.ShaderMaterial | undefined;
    if (mat) mat.uniforms.uPixelRatio.value = gl.getPixelRatio();
  }, [gl]);

  // Initial mount size only, by design: no resize resampling.
  const worldRef = useRef({ w: viewport.width, h: viewport.height });

  // Cloud first, glyphs once fonts are ready. State (not a mutated buffer)
  // so the attribute is recreated and re-uploaded: mutating the array of a
  // remounted attribute leaves the GPU holding the stale first upload.
  const [targets, setTargets] = useState<Float32Array>(data.targets);
  const reportedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    if (viewport.width > 0.5) {
      worldRef.current = { w: viewport.width, h: viewport.height };
    }

    const report = (ok: boolean) => {
      if (reportedRef.current) return;
      reportedRef.current = true;
      onOutcome?.(ok);
    };

    const trySample = (): boolean => {
      if (reportedRef.current) return true;
      if (cancelled || worldRef.current.w < 0.5) return false;
      const sampled = sampleGlyphTargets(
        data.count,
        worldRef.current.w * 0.9,
        worldRef.current.h * 0.62
      );
      if (!sampled) return false;
      setTargets(sampled);
      report(true);
      return true;
    };

    // Attempt immediately with whatever font is resolved (a fallback face
    // still spells the name), refine once web fonts settle, and retry once
    // more. A stalled fonts.ready or an empty pixel read must never be the
    // reason the name stays noise: report(false) hands off to the DOM name.
    const okNow = trySample();
    document.fonts.ready.then(() => {
      if (!cancelled) trySample();
    });
    const retry = window.setTimeout(() => {
      if (!trySample() && !okNow) report(false);
    }, 1800);

    return () => {
      cancelled = true;
      window.clearTimeout(retry);
    };
  }, [data, viewport.width, viewport.height, onOutcome]);

  // Demand-mode canvases must be told to render after the new target buffer
  // commits, or the assembled name never paints (reduced-motion path).
  useEffect(() => {
    const id = requestAnimationFrame(() => invalidate());
    return () => cancelAnimationFrame(id);
  }, [targets, invalidate]);

  useFrame((_, delta) => {
    const points = pointsRef.current;
    if (!points) return;
    // Skip the draw call entirely once the name has fully dissolved.
    points.visible = handles.uDissolve.value < 0.999;
    const u = (points.material as THREE.ShaderMaterial).uniforms;
    u.uProgress.value = handles.uProgress.value;
    u.uDissolve.value = handles.uDissolve.value;
    if (reduced) return;
    u.uTime.value += delta;
    TMP.set(handles.mouse.x, handles.mouse.y, 0);
    (u.uMouse.value as THREE.Vector3).lerp(TMP, 1 - Math.exp(-7 * delta));
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[data.positions, 3]}
        />
        <bufferAttribute
          key={targets === data.targets ? "cloud" : "glyphs"}
          attach="attributes-aTarget"
          args={[targets, 3]}
        />
        <bufferAttribute attach="attributes-aRand" args={[data.rands, 4]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}
