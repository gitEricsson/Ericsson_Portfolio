"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

type Props = {
  children: ReactNode;
  className?: string;
  /** How far the element leans toward the cursor, 0 to 1. */
  strength?: number;
};

/** Magnetic hover: the child leans toward the cursor and snaps back on leave. */
export default function Magnetic({
  children,
  className = "",
  strength = 0.35,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reduced) return;
      if (!window.matchMedia("(pointer: fine)").matches) return;

      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });

      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      return () => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      };
    },
    { dependencies: [reduced, strength] }
  );

  return (
    <div ref={ref} className={`inline-block ${className}`}>
      {children}
    </div>
  );
}
