"use client";

import { useEffect, useRef, useState } from "react";
import { ambient } from "@/lib/ambient";

/**
 * Instrument HUD: Lagos clock and sound toggle bottom-left, scroll depth
 * as hex bottom-right. Part of the readout grammar. Survives polarity
 * via difference blend.
 */
export default function Hud() {
  const timeRef = useRef<HTMLSpanElement>(null);
  const hexRef = useRef<HTMLSpanElement>(null);
  const [sndOn, setSndOn] = useState(false);

  useEffect(() => {
    setSndOn(ambient.init());
  }, []);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Lagos",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const tick = () => {
      if (timeRef.current) {
        timeRef.current.textContent = `LAGOS ${fmt.format(new Date())}`;
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!hexRef.current) return;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const depth = max > 0 ? window.scrollY / max : 0;
        const hex = Math.round(depth * 0xffff)
          .toString(16)
          .toUpperCase()
          .padStart(4, "0");
        hexRef.current.textContent = `0x${hex}`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-9980 mix-blend-difference">
      <div className="flex items-baseline justify-between px-5 py-3 md:px-8">
        <span className="flex items-baseline gap-4">
          <span ref={timeRef} aria-hidden="true" className="type-readout text-white" />
          <button
            type="button"
            onClick={() => setSndOn(ambient.toggle())}
            aria-pressed={sndOn}
            aria-label="Toggle background music: Erik Satie, Gymnopédie No. 1"
            title="Erik Satie, Gymnopédie No. 1. Recording: Kevin MacLeod (incompetech.com), CC BY 3.0."
            className="type-readout pointer-events-auto cursor-pointer text-white transition-opacity duration-300 hover:opacity-60"
          >
            SND {sndOn ? "ON" : "OFF"}
          </button>
        </span>
        <span aria-hidden="true" className="type-readout hidden text-white sm:inline">
          6.5244°N 3.3792°E
        </span>
        <span ref={hexRef} aria-hidden="true" className="type-readout text-white">
          0x0000
        </span>
      </div>
    </div>
  );
}
