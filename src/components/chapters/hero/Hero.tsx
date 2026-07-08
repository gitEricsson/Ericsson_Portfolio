'use client';

import { useMemo, useRef, useState } from 'react';
import { identity } from '@/content/profile';
import { gsap, useGSAP, ScrollTrigger, SCRAMBLE_CHARS } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import SectionCanvas from '@/components/shared/SectionCanvas';
import IdentityField, { type HeroHandles } from './IdentityField';

// Camera sits at z=10 with fov 50: half-height of the z=0 plane in world units.
const HALF_H = Math.tan((50 * Math.PI) / 360) * 10;
// Parked target far below the text so repulsion fully releases off-pointer.
const MOUSE_PARKED_Y = -60;

/**
 * Chapter 01: the identity field. A full-viewport plate pinned under the
 * manifesto, which slides over it while the name dissolves into noise.
 */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const tickerRef = useRef<HTMLSpanElement>(null);
  const pulseRef = useRef<HTMLSpanElement>(null);
  const [covered, setCovered] = useState(false);
  const reduced = useReducedMotion();

  // Plain mutable objects shared with the scene: GSAP writes, shader reads.
  const handles = useMemo<HeroHandles>(
    () => ({
      uProgress: { value: 0 },
      uDissolve: { value: 0 },
      mouse: { x: 0, y: MOUSE_PARKED_Y },
    }),
    [],
  );

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      if (reduced) {
        handles.uProgress.value = 1;
        return;
      }

      const fades = gsap.utils.toArray<HTMLElement>(
        '[data-hero-fade]',
        section,
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
          ease: 'expo.inOut',
          overwrite: true,
        });
        gsap.to(fades, {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: 'quart.out',
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
              ease: 'none',
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

      window.addEventListener('er:ready', startIntro);
      // The preloader may have fired before this chapter mounted.
      const fallback = window.setTimeout(startIntro, 4500);

      if (pulseRef.current) {
        gsap.to(pulseRef.current, {
          opacity: 0.3,
          duration: 1.6,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
          delay: 2.6,
        });
      }

      // The name dissolves into noise as the manifesto plate covers it.
      // Element reference, not a selector string: useGSAP scoping would
      // otherwise try to resolve "#manifesto" inside #hero and fail.
      const manifesto = document.querySelector<HTMLElement>('#manifesto');
      if (manifesto) {
        gsap.to(handles.uDissolve, {
          value: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: manifesto,
            start: 'top bottom',
            end: 'top 12%',
            scrub: 0.6,
          },
        });
        // Once fully covered, drop the render loop to demand: the plate is
        // sticky for the whole page and would otherwise draw forever.
        ScrollTrigger.create({
          trigger: manifesto,
          start: 'top top',
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
      section.addEventListener('pointermove', onMove);
      section.addEventListener('pointerleave', onLeave);

      return () => {
        window.removeEventListener('er:ready', startIntro);
        window.clearTimeout(fallback);
        if (rolesTimer !== undefined) window.clearInterval(rolesTimer);
        roleTween?.kill();
        section.removeEventListener('pointermove', onMove);
        section.removeEventListener('pointerleave', onLeave);
      };
    },
    { scope: sectionRef, dependencies: [reduced] },
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

      <SectionCanvas
        className="absolute inset-0"
        camera={{ position: [0, 0, 10], fov: 50 }}
        frameloop={reduced || covered ? 'demand' : 'always'}
      >
        <IdentityField handles={handles} />
      </SectionCanvas>

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
          <span className="sr-only">{identity.roles.join('. ')}</span>
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
