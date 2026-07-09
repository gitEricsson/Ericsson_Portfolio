"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { contact } from "@/content/profile";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { scrollToSection } from "@/lib/scroll";
import SectionCanvas from "@/components/shared/SectionCanvas";
import Readout from "@/components/shared/Readout";
import SplitReveal from "@/components/shared/SplitReveal";
import Magnetic from "@/components/shared/Magnetic";
import dynamic from "next/dynamic";
import type { RipplePointer } from "./Ripples";

// three.js stays out of the initial bundle: this decorative scene loads
// only when the contact chapter mounts.
const Ripples = dynamic(() => import("./Ripples"), { ssr: false });

/** Chapter 06: contact plus site footer. A white page broadcasting quiet ripples. */
export default function Signal() {
  const sectionRef = useRef<HTMLElement>(null);
  // Stable object handed to the scene once; mutated on pointer events, read per frame.
  const pointerRef = useRef<RipplePointer>({ x: 0, y: 0, active: false });
  const copyTimerRef = useRef<number | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => () => window.clearTimeout(copyTimerRef.current), []);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section || reduced) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-signal-fade]", section);
      gsap.from(items, {
        autoAlpha: 0,
        y: 26,
        duration: 1.1,
        ease: "quart.out",
        stagger: 0.12,
        scrollTrigger: { trigger: section, start: "top 70%", once: true },
      });
    },
    { scope: sectionRef, dependencies: [reduced] }
  );

  const handlePointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    // The canvas fills the section, so section NDC equals canvas NDC.
    const rect = e.currentTarget.getBoundingClientRect();
    const p = pointerRef.current;
    p.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    p.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    p.active = true;
  };

  const handlePointerLeave = () => {
    pointerRef.current.active = false;
  };

  const handleEmailClick = () => {
    // The mailto default proceeds; the copy is a bonus, not a replacement.
    if ("clipboard" in navigator) {
      navigator.clipboard.writeText(contact.email).catch(() => undefined);
    }
    setCopied(true);
    window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section
      id="signal"
      ref={sectionRef}
      data-polarity="light"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative flex min-h-svh flex-col justify-between overflow-hidden bg-paper px-5 py-[clamp(6rem,14vh,12rem)] text-ink md:px-8"
    >
      {/* Local styles only: globals stay untouched. */}
      <style>{`
        .signal-underline {
          position: relative;
          text-decoration: none;
        }
        .signal-underline::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -0.12em;
          width: 100%;
          height: max(0.05em, 1px);
          background: currentColor;
          transform: scaleX(0);
          transform-origin: 100% 50%;
          transition: transform 0.55s var(--ease-out-expo);
        }
        .signal-underline:hover::after,
        .signal-underline:focus-visible::after {
          transform: scaleX(1);
          transform-origin: 0% 50%;
        }
        @media (prefers-reduced-motion: reduce) {
          .signal-underline::after {
            transition: none;
          }
        }
      `}</style>

      <SectionCanvas
        className="pointer-events-none absolute inset-0"
        camera={{ position: [0, 0, 30], fov: 50 }}
        frameloop={reduced ? "demand" : "always"}
      >
        <Ripples pointer={pointerRef.current} />
      </SectionCanvas>

      <div className="relative z-10 flex items-baseline justify-between gap-4">
        <Readout text={contact.kicker} className="text-ink-60" />
        <Readout text="RESPONSE TIME: FAST" className="text-ink-40" />
      </div>

      <div className="relative z-10 py-14 md:py-20">
        <SplitReveal as="h2" mode="chars" className="type-hero text-ink">
          {contact.headline}
        </SplitReveal>

        <p data-signal-fade className="type-body mt-6 max-w-[46ch] text-ink-60">
          {contact.line}
        </p>

        <div data-signal-fade className="mt-10 md:mt-14">
          <Magnetic strength={0.2}>
            <a
              href={`mailto:${contact.email}`}
              onClick={handleEmailClick}
              className="signal-underline inline-block break-all font-mono leading-tight text-ink"
              style={{ fontSize: "clamp(1.2rem, 3.4vw, 2.6rem)" }}
            >
              {copied ? "COPIED TO CLIPBOARD" : contact.email}
            </a>
          </Magnetic>
          <span aria-live="polite" className="sr-only">
            {copied ? "Email address copied to clipboard" : ""}
          </span>
        </div>

        <Readout
          text="FIG. 06 / BROADCAST"
          className="pointer-events-none absolute -bottom-6 right-0 hidden text-ink-40 lg:block"
        />

        <ul data-signal-fade className="mt-10 flex flex-wrap gap-x-6 gap-y-3 md:mt-14">
          {contact.links.map((link) => {
            const external = link.href.startsWith("http");
            return (
              <li key={link.label}>
                <Magnetic strength={0.3}>
                  <a
                    href={link.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noreferrer" : undefined}
                    className="font-mono text-[0.8125rem] uppercase tracking-[0.08em] text-ink-60 transition-colors duration-300 hover:text-ink focus-visible:text-ink"
                  >
                    <span aria-hidden="true">[&nbsp;</span>
                    {link.label}
                    <span aria-hidden="true">&nbsp;]</span>
                  </a>
                </Magnetic>
              </li>
            );
          })}
        </ul>
      </div>

      <footer
        data-signal-fade
        className="relative z-10 grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-6 hairline md:grid-cols-12 md:gap-x-8"
      >
        <Readout
          as="p"
          text="(c) MMXXVI ERICSSON RAPHAEL"
          className="text-ink-40 md:col-span-3"
        />
        <Readout
          as="p"
          text="TYPE: ARCHIVO / FRAGMENT MONO / EB GARAMOND"
          className="text-ink-40 md:col-span-4"
        />
        <Readout
          as="p"
          text="BUILT: NEXT.JS / THREE.JS / GSAP"
          className="text-ink-40 md:col-span-3"
        />
        <p className="text-right md:col-span-2">
          <button
            type="button"
            onClick={() => scrollToSection("#top")}
            className="signal-underline type-readout cursor-pointer text-ink-40 transition-colors duration-300 hover:text-ink focus-visible:text-ink"
          >
            RETURN TO SIGNAL
          </button>
        </p>
        {/* CC BY 3.0 attribution for the ambient recording. */}
        <p className="type-readout col-span-2 mt-2 text-ink-40 md:col-span-12">
          AUDIO: SATIE, GYMNOPEDIE NO. 1 / PERF.{" "}
          <a
            href="https://incompetech.com"
            target="_blank"
            rel="noreferrer"
            className="signal-underline transition-colors duration-300 hover:text-ink"
          >
            KEVIN MACLEOD
          </a>{" "}
          /{" "}
          <a
            href="https://creativecommons.org/licenses/by/3.0/"
            target="_blank"
            rel="noreferrer"
            className="signal-underline transition-colors duration-300 hover:text-ink"
          >
            CC BY 3.0
          </a>
        </p>
      </footer>
    </section>
  );
}
