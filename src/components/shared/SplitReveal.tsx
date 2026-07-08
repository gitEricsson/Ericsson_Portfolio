"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** "lines" (default) or "chars" for display type. */
  mode?: "lines" | "chars";
  stagger?: number;
  delay?: number;
  /** Start position for ScrollTrigger. */
  start?: string;
};

/** Masked split-text reveal on scroll. The workhorse entrance for all copy. */
export default function SplitReveal({
  children,
  as: Tag = "div",
  className = "",
  mode = "lines",
  stagger,
  delay = 0,
  start = "top 85%",
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reduced) return;

      let split: SplitText | undefined;
      document.fonts.ready.then(() => {
        if (!el.isConnected) return;
        split = SplitText.create(el, {
          type: mode === "chars" ? "chars,lines" : "lines",
          mask: mode === "chars" ? "chars" : "lines",
          autoSplit: true,
          onSplit: (self) => {
            const targets = mode === "chars" ? self.chars : self.lines;
            return gsap.from(targets, {
              yPercent: 115,
              duration: mode === "chars" ? 0.8 : 1.1,
              stagger: stagger ?? (mode === "chars" ? 0.02 : 0.09),
              delay,
              ease: "expo.out",
              scrollTrigger: { trigger: el, start, once: true },
            });
          },
        });
      });

      return () => split?.revert();
    },
    { dependencies: [reduced, mode] }
  );

  return (
    // @ts-expect-error polymorphic ref
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
