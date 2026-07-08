"use client";

import { createElement, useRef, type ElementType } from "react";
import { gsap, useGSAP, SCRAMBLE_CHARS } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

type Props = {
  text: string;
  className?: string;
  as?: ElementType;
  delay?: number;
};

/** Mono instrument label that decodes itself when scrolled into view. */
export default function Readout({
  text,
  className = "",
  as: Tag = "span",
  delay = 0,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      gsap.to(ref.current, {
        duration: 1.1,
        delay,
        scrambleText: { text, chars: SCRAMBLE_CHARS, speed: 0.4 },
        ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top 92%", once: true },
      });
    },
    { dependencies: [text, reduced] }
  );

  return createElement(
    Tag,
    {
      ref,
      className: `type-readout ${className}`,
      "aria-label": text,
    } as Record<string, unknown>,
    reduced ? text : "·"
  );
}
