"use client";

import { useRef } from "react";
import { manifesto } from "@/content/profile";
import Readout from "@/components/shared/Readout";
import SplitReveal from "@/components/shared/SplitReveal";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Square-to-sine signal path in fixed user units (1200 x 48).
 * Each half-cycle holds flat then transitions. The flat fraction decays
 * left to right, so square edges resolve into a smooth sine.
 */
function buildSignalPath(): string {
  const W = 1200;
  const MID = 24;
  const AMP = 16;
  const N = 12;
  const h = W / N;
  const r = (v: number) => Math.round(v * 10) / 10;

  let y = MID - AMP;
  let d = `M 0 ${y}`;
  for (let i = 0; i < N; i += 1) {
    const yNext = y === MID - AMP ? MID + AMP : MID - AMP;
    // First three half-cycles pure square, last three pure sine.
    const morph = i <= 2 ? 0 : i >= N - 3 ? 1 : (i - 2) / (N - 5);
    const flat = 0.94 * (1 - morph);
    const x1 = (i + 1) * h;
    const xFlat = i * h + h * flat;
    const span = x1 - xFlat;
    d += ` L ${r(xFlat)} ${y}`;
    d += ` C ${r(xFlat + span * 0.4)} ${y} ${r(x1 - span * 0.4)} ${yNext} ${r(x1)} ${yNext}`;
    y = yNext;
  }
  return d;
}

const SIGNAL_PATH = buildSignalPath();

/** The black/white gesture: solid ink vs a hollow outline of the same type. */
const OUTLINE_STYLE = {
  WebkitTextFillColor: "transparent",
  WebkitTextStroke: "1.5px currentColor",
} as const;

const INDENTS = ["", "md:ml-[10%]", "md:ml-[18%]"];

export default function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const figureRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;

      // Scrub-drawn signal line. Dash units match user units since the
      // path length is measured before any viewport stretch.
      const path = pathRef.current;
      if (path && figureRef.current) {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: figureRef.current,
            start: "top 88%",
            end: "top 32%",
            scrub: true,
          },
        });
      }

      // Count-up on the instrument strip. Suffixes stay static in the DOM.
      const counters = gsap.utils.toArray<HTMLElement>(
        "[data-count]",
        sectionRef.current ?? undefined
      );
      counters.forEach((el, i) => {
        const target = Number(el.dataset.count ?? "0");
        if (!Number.isFinite(target)) return;
        const proxy = { n: 0 };
        el.textContent = "0";
        gsap.to(proxy, {
          n: target,
          duration: 1.6,
          delay: i * 0.12,
          ease: "expo.out",
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 90%",
            once: true,
          },
          onUpdate: () => {
            el.textContent = String(Math.round(proxy.n));
          },
        });
      });
    },
    { scope: sectionRef, dependencies: [reduced] }
  );

  return (
    <section
      id="manifesto"
      ref={sectionRef}
      data-polarity="light"
      className="relative z-10 min-h-svh bg-paper text-ink px-5 md:px-8 py-[clamp(6rem,14vh,12rem)]"
    >
      {/* Vertical rail readout, lg+ only. Mobile gets the inline version below. */}
      <Readout
        text={manifesto.kicker}
        className="writing-vertical absolute left-5 md:left-8 top-[clamp(6rem,14vh,12rem)] hidden lg:block text-ink-60"
      />

      <div className="grid grid-cols-12 gap-x-4 md:gap-x-6">
        <Readout
          text={manifesto.kicker}
          className="col-span-12 mb-10 block text-ink-60 lg:hidden"
        />

        <h2 className="type-chapter col-span-12 lg:col-start-2 lg:col-span-11">
          {manifesto.statement.map((segment, i) => (
            <SplitReveal
              key={segment.text}
              as="span"
              className={`block ${INDENTS[i] ?? ""}`}
              delay={i * 0.18}
            >
              {segment.outline ? (
                <span style={OUTLINE_STYLE}>{segment.text}</span>
              ) : (
                segment.text
              )}
            </SplitReveal>
          ))}
        </h2>

        <figure
          ref={figureRef}
          className="col-span-12 lg:col-start-2 lg:col-span-11 mt-[clamp(3.5rem,8vh,6rem)]"
        >
          <svg
            className="block h-12 w-full"
            viewBox="0 0 1200 48"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            {/* non-scaling stroke: the viewBox stretches to full width, the 1.5px line must not. */}
            <path
              ref={pathRef}
              d={SIGNAL_PATH}
              stroke="currentColor"
              strokeWidth={1.5}
              strokeOpacity={0.4}
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <figcaption className="mt-3 text-right">
            <Readout
              text="FIG. 02 / SQUARE TO SINE"
              className="text-ink-40"
            />
          </figcaption>
        </figure>

        <div className="col-span-12 md:col-span-9 lg:col-start-6 lg:col-span-7 mt-[clamp(3.5rem,8vh,6rem)]">
          {manifesto.body().map((paragraph, i) => (
            <SplitReveal
              key={i}
              as="p"
              className={`type-body max-w-[68ch] ${i > 0 ? "mt-6 text-ink-60" : ""}`}
              delay={i * 0.1}
            >
              {paragraph}
            </SplitReveal>
          ))}
        </div>

        {/* Instrument strip: hairline-framed, mono values, lowercase labels. */}
        <div
          ref={statsRef}
          className="hairline col-span-12 mt-[clamp(4rem,10vh,7rem)] grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-4 md:gap-x-6 border-y py-7"
        >
          {manifesto.stats().map((stat) => {
            const m = /^(\d+)(.*)$/.exec(stat.value);
            const num = m ? m[1] : stat.value;
            const suffix = m ? m[2] : "";
            return (
              <div
                key={stat.label}
                className="hairline flex flex-col gap-2 md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:pl-6"
              >
                {/* Years are computed at render; a build older than the
                    current month may prerender a different number. */}
                <span
                  suppressHydrationWarning
                  className="font-mono text-2xl leading-none tabular-nums"
                >
                  <span className="sr-only">{stat.value}</span>
                  <span aria-hidden="true">
                    <span data-count={num}>{num}</span>
                    {suffix}
                  </span>
                </span>
                <span className="type-readout lowercase text-ink-60">
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
