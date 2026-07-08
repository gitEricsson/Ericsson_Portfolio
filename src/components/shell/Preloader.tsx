"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, SCRAMBLE_CHARS } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Boot sequence: scrambled name, counter to 100 along a hairline,
 * then the whole plate wipes upward. Fires "er:ready" when done.
 */
export default function Preloader() {
  const [done, setDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      window.dispatchEvent(new Event("er:ready"));
      setDone(true);
      return;
    }
    const root = rootRef.current;
    if (!root) return;

    document.documentElement.style.overflow = "hidden";
    const counter = { v: 0 };

    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.style.overflow = "";
        window.dispatchEvent(new Event("er:ready"));
        setDone(true);
      },
    });

    tl.to(nameRef.current, {
      duration: 1.1,
      scrambleText: {
        text: "ERICSSON RAPHAEL",
        chars: SCRAMBLE_CHARS,
        speed: 0.5,
      },
      ease: "none",
    })
      .to(
        counter,
        {
          v: 100,
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: () => {
            if (countRef.current) {
              countRef.current.textContent = String(
                Math.round(counter.v)
              ).padStart(3, "0");
            }
          },
        },
        0.15
      )
      .to(
        lineRef.current,
        { scaleX: 1, duration: 1.5, ease: "power2.inOut" },
        0.15
      )
      .to(root, {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 0.9,
        ease: "expo.inOut",
        delay: 0.15,
      });

    return () => {
      tl.kill();
      document.documentElement.style.overflow = "";
    };
  }, [reduced]);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black text-white"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      aria-hidden="true"
    >
      <div className="w-[min(28rem,80vw)]">
        <div className="mb-3 flex items-end justify-between">
          <span ref={nameRef} className="type-readout">
            ---
          </span>
          <span ref={countRef} className="type-readout tabular-nums">
            000
          </span>
        </div>
        <div
          ref={lineRef}
          className="h-px origin-left scale-x-0 bg-white"
        />
        <div className="mt-3 flex justify-between">
          <span className="type-readout text-g-500">SIGNAL / NOISE</span>
          <span className="type-readout text-g-500">LAGOS 6.52°N</span>
        </div>
      </div>
    </div>
  );
}
