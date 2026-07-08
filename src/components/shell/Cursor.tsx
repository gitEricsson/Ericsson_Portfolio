"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Difference-blend cursor: a dot and a trailing ring that invert whatever they cross. */
export default function Cursor() {
  const [active, setActive] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setActive(true);
  }, [reduced]);

  useEffect(() => {
    if (!active) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.documentElement.classList.add("cursor-hidden");

    const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const interactive = (e.target as HTMLElement).closest(
        "a, button, [data-cursor]"
      );
      gsap.to(ring, {
        scale: interactive ? 2.2 : 1,
        opacity: interactive ? 0.9 : 0.5,
        duration: 0.35,
      });
      gsap.to(dot, { scale: interactive ? 0.4 : 1, duration: 0.35 });
    };

    const onDown = () => gsap.to(ring, { scale: 0.8, duration: 0.2 });
    const onUp = () => gsap.to(ring, { scale: 1, duration: 0.3 });

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    return () => {
      document.documentElement.classList.remove("cursor-hidden");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, [active]);

  if (!active) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-9995 -ml-1 -mt-1 h-2 w-2 rounded-full bg-white mix-blend-difference"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-9995 -ml-4 -mt-4 h-8 w-8 rounded-full border border-white opacity-50 mix-blend-difference"
      />
    </>
  );
}
