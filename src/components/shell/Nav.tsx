"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { scrollState, scrollToSection } from "@/lib/scroll";

const LINKS = [
  { label: "MANIFESTO", href: "#manifesto", index: "02" },
  { label: "EXPERIENCE", href: "#experience", index: "03" },
  { label: "WORKS", href: "#works", index: "04" },
  { label: "LENS", href: "#lens", index: "05" },
  { label: "SIGNAL", href: "#signal", index: "06" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const go = (href: string) => {
    setOpen(false);
    scrollToSection(href);
  };

  useEffect(() => {
    const lenis = scrollState.lenis;
    if (open) {
      lenis?.stop();
      const items = overlayRef.current?.querySelectorAll("[data-menu-item]");
      if (items) {
        gsap.fromTo(
          items,
          { yPercent: 110 },
          { yPercent: 0, stagger: 0.06, duration: 0.8, ease: "expo.out", delay: 0.1 }
        );
      }
    } else {
      lenis?.start();
    }
    return () => {
      lenis?.start();
    };
  }, [open]);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-9980 mix-blend-difference">
        <div className="flex items-baseline justify-between px-5 py-4 md:px-8">
          <button
            onClick={() => go("#top")}
            className="type-readout pointer-events-auto text-white"
            aria-label="Back to top"
          >
            ERICSSON RAPHAEL <span className="opacity-50">/ EST. LAGOS</span>
          </button>

          <nav className="pointer-events-auto hidden gap-6 lg:flex" aria-label="Chapters">
            {LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => go(l.href)}
                className="type-readout group relative text-white"
              >
                <span className="opacity-40">{l.index}</span> {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-white transition-transform duration-300 ease-out group-hover:origin-left group-hover:scale-x-100" />
              </button>
            ))}
          </nav>

          <button
            onClick={() => setOpen(true)}
            className="type-readout pointer-events-auto text-white lg:hidden"
            aria-label="Open index"
          >
            INDEX +
          </button>
        </div>
      </header>

      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-9985 flex flex-col justify-between bg-black px-5 py-4 text-white"
          role="dialog"
          aria-modal="true"
          aria-label="Site index"
        >
          <div className="flex items-baseline justify-between">
            <span className="type-readout">INDEX</span>
            <button
              onClick={() => setOpen(false)}
              className="type-readout"
              aria-label="Close index"
            >
              CLOSE ×
            </button>
          </div>
          <nav className="flex flex-col gap-1" aria-label="Chapters">
            {LINKS.map((l) => (
              <div key={l.href} className="overflow-hidden">
                <button
                  data-menu-item
                  onClick={() => go(l.href)}
                  className="type-chapter block text-left"
                >
                  <span className="type-readout mr-3 align-super opacity-40">
                    {l.index}
                  </span>
                  {l.label}
                </button>
              </div>
            ))}
          </nav>
          <div className="flex justify-between">
            <span className="type-readout opacity-50">SIGNAL / NOISE</span>
            <span className="type-readout opacity-50">MMXXVI</span>
          </div>
        </div>
      )}
    </>
  );
}
