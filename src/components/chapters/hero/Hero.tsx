"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { identity } from "@/content/profile";
import { gsap, useGSAP, ScrollTrigger, SCRAMBLE_CHARS } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import type { HeroHandles } from "./IdentityField";

// three.js loads after first paint: the DOM name below is the instant,
// reliable base layer, the particle field is a progressive enhancement.
const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

// Camera sits at z=10 with fov 50: half-height of the z=0 plane in world units.
const HALF_H = Math.tan((50 * Math.PI) / 360) * 10;
// Parked target far below the text so repulsion fully releases off-pointer.
const MOUSE_PARKED_Y = -60;

function detectWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * Chapter 01: the identity field. A full-viewport plate pinned under the
 * manifesto, which slides over it while the name dissolves into noise.
 */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const tickerRef = useRef<HTMLSpanElement>(null);
  const pulseRef = useRef<HTMLSpanElement>(null);
  const [covered, setCovered] = useState(false);
  const [webgl, setWebgl] = useState(true);
  // The DOM name is the guaranteed layer: shown whenever the particle name
  // cannot be trusted (no WebGL, sampling failed, or it never assembled).
  const [nameVisible, setNameVisible] = useState(false);
  const assembledRef = useRef(false);
  const dbgRef = useRef<HTMLSpanElement>(null);
  const [dbg, setDbg] = useState(false);
  const reduced = useReducedMotion();

  // Plain mutable objects shared with the scene: GSAP writes, shader reads.
  const handles = useMemo<HeroHandles>(
    () => ({
      uProgress: { value: 0 },
      uDissolve: { value: 0 },
      mouse: { x: 0, y: MOUSE_PARKED_Y },
    }),
    []
  );

  const onOutcome = useCallback((ok: boolean) => {
    if (ok) assembledRef.current = true;
    else setNameVisible(true);
  }, []);

  // Append ?debug to the URL to read the live shader values from any device.
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("debug")) return;
    setDbg(true);
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (dbgRef.current) {
        dbgRef.current.textContent = `PROG ${handles.uProgress.value.toFixed(
          2
        )}  DISS ${handles.uDissolve.value.toFixed(2)}  IH ${
          window.innerHeight
        }`;
      }
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [handles]);

  // WebGL gate plus a watchdog: if the particles have not reported an
  // assembled name within the window, reveal the DOM name and leave it.
  useEffect(() => {
    if (!detectWebGL()) {
      setWebgl(false);
      setNameVisible(true);
      return;
    }
    const id = window.setTimeout(() => {
      if (!assembledRef.current) setNameVisible(true);
    }, 4000);
    return () => window.clearTimeout(id);
  }, []);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      if (reduced) {
        handles.uProgress.value = 1;
        return;
      }

      const fades = gsap.utils.toArray<HTMLElement>(
        "[data-hero-fade]",
        section
      );
      gsap.set(fades, { autoAlpha: 0, y: 12 });

      let started = false;
      let rolesTimer: number | undefined;
      let roleTween: ReturnType<typeof gsap.to> | undefined;

      const startIntro = () => {
        if (started) return;
        started = true;
        gsap.to(handles.uProgress, {
          value: 1,
          duration: 2.2,
          ease: "expo.inOut",
          overwrite: true,
        });
        gsap.to(fades, {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: "quart.out",
          delay: 1.2,
          stagger: 0.12,
        });
        const ticker = tickerRef.current;
        if (ticker) {
          let i = 0;
          rolesTimer = window.setInterval(() => {
            i = (i + 1) % identity.roles.length;
            roleTween = gsap.to(ticker, {
              duration: 1.1,
              ease: "none",
              scrambleText: {
                text: identity.roles[i],
                chars: SCRAMBLE_CHARS,
                speed: 0.4,
              },
              overwrite: true,
            });
          }, 2400);
        }
      };

      window.addEventListener("er:ready", startIntro);
      // The preloader may have fired before this chapter mounted.
      const fallback = window.setTimeout(startIntro, 4500);

      if (pulseRef.current) {
        gsap.to(pulseRef.current, {
          opacity: 0.3,
          duration: 1.6,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
          delay: 2.6,
        });
      }

      // The name dissolves into noise as the next section rises over it.
      // Anchored to the hero's OWN top with start "top top", so at scroll 0
      // the progress is exactly 0. The previous trigger keyed off the
      // manifesto's "top bottom", whose position depends on the hero's svh
      // height vs the live innerHeight; on mobile the address bar makes those
      // diverge, leaving a nonzero dissolve at rest (the name never fully
      // resolves). Anchoring to document top removes that dependency.
      gsap.to(handles.uDissolve, {
        value: 1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => "+=" + window.innerHeight * 0.85,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
      // Once the plate is fully covered, drop the render loop to demand: it
      // is sticky for the whole page and would otherwise draw forever.
      const manifesto = document.querySelector<HTMLElement>("#manifesto");
      if (manifesto) {
        ScrollTrigger.create({
          trigger: manifesto,
          start: "top top",
          onEnter: () => setCovered(true),
          onLeaveBack: () => setCovered(false),
        });
      }

      // The section is a pinned full-viewport plate: window dims are its rect.
      const onMove = (e: PointerEvent) => {
        const halfW = HALF_H * (window.innerWidth / window.innerHeight);
        handles.mouse.x = ((e.clientX / window.innerWidth) * 2 - 1) * halfW;
        handles.mouse.y = (1 - (e.clientY / window.innerHeight) * 2) * HALF_H;
      };
      const onLeave = () => {
        handles.mouse.x = 0;
        handles.mouse.y = MOUSE_PARKED_Y;
      };
      section.addEventListener("pointermove", onMove);
      section.addEventListener("pointerleave", onLeave);

      return () => {
        window.removeEventListener("er:ready", startIntro);
        window.clearTimeout(fallback);
        if (rolesTimer !== undefined) window.clearInterval(rolesTimer);
        roleTween?.kill();
        section.removeEventListener("pointermove", onMove);
        section.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: sectionRef, dependencies: [reduced] }
  );

  return (
    <section
      id="hero"
      ref={sectionRef}
      data-polarity="dark"
      className="sticky top-0 z-0 h-svh overflow-hidden bg-paper text-ink"
    >
      <h1 className="sr-only">
        Ericsson Raphael. Software and Data Engineer. Lagos.
      </h1>

      {dbg && (
        <span
          ref={dbgRef}
          className="type-readout fixed left-1/2 top-16 z-9999 -translate-x-1/2 bg-black px-2 py-1 text-white"
        >
          PROG 0.00 DISS 0.00
        </span>
      )}

      {/* Guaranteed name: the particle field, if it works, sits on top and
          the DOM name stays hidden. If not, this is what the visitor sees. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-[5] flex flex-col items-center justify-center px-5 text-center transition-opacity duration-700 ${
          nameVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="type-hero leading-[0.85] text-ink">
          {identity.firstName}
        </span>
        <span className="type-hero leading-[0.85] text-ink">
          {identity.lastName}
        </span>
      </div>

      {webgl && (
        <HeroCanvas
          handles={handles}
          demand={reduced || covered}
          onOutcome={onOutcome}
        />
      )}

      <div className="pointer-events-none absolute inset-0 z-10">
        <div
          data-hero-fade
          className="absolute bottom-0 left-0 flex flex-col items-start gap-1.5 px-5 pb-14 md:px-8"
        >
          <span
            ref={tickerRef}
            aria-hidden="true"
            className="type-readout text-ink"
          >
            {identity.roles[0]}
          </span>
          <span className="sr-only">{identity.roles.join(". ")}</span>
          <span className="type-readout text-ink-60">MONIEPOINT / UK</span>
        </div>

        <div
          data-hero-fade
          className="absolute bottom-0 right-0 px-5 pb-14 md:px-8"
        >
          <span
            ref={pulseRef}
            className="type-readout inline-block text-ink-60"
          >
            SCROLL TO DECODE
          </span>
        </div>

        <span
          data-hero-fade
          className="type-readout writing-vertical absolute right-5 top-1/2 -translate-y-1/2 text-ink-40 md:right-8"
        >
          FIG. 01 / IDENTITY FIELD
        </span>
      </div>
    </section>
  );
}
