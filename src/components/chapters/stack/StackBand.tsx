'use client';

import { useRef, useState } from 'react';
import { stackRows } from '@/content/profile';
import Readout from '@/components/shared/Readout';
import { gsap, useGSAP } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

/* Credits pacing: every column rolls at the same per-item speed, so
   columns of different lengths loop at different periods but read evenly. */
const SECONDS_PER_ITEM = 1.9;
const VIEWPORT_CLASS = 'h-[300px] md:h-[340px]';
const EDGE_MASK =
  'linear-gradient(to bottom, transparent, black 14%, black 86%, transparent)';

/**
 * The stack, rolled like the cast of a film: five disciplines with equal
 * billing, each column a slow end-credits scroll. Hover holds a column;
 * EXPAND lays the whole cast out flat with no motion at all.
 */
export default function StackBand() {
  const sectionRef = useRef<HTMLElement>(null);
  const tweensRef = useRef<Map<number, gsap.core.Tween>>(new Map());
  const [expanded, setExpanded] = useState(false);
  const reduced = useReducedMotion();

  const flat = reduced || expanded;

  useGSAP(
    () => {
      tweensRef.current.clear();
      if (flat) return;
      gsap.utils
        .toArray<HTMLElement>('[data-credits-track]', sectionRef.current)
        .forEach((track, i) => {
          const count = Number(track.dataset.count ?? '8');
          const tween = gsap.to(track, {
            yPercent: -50,
            duration: count * SECONDS_PER_ITEM,
            ease: 'none',
            repeat: -1,
          });
          tweensRef.current.set(i, tween);
        });
    },
    { scope: sectionRef, dependencies: [flat] },
  );

  const holdColumn = (i: number, hold: boolean) => {
    const tween = tweensRef.current.get(i);
    if (!tween) return;
    gsap.to(tween, { timeScale: hold ? 0 : 1, duration: 0.5 });
  };

  return (
    <section
      ref={sectionRef}
      data-polarity="dark"
      className="hairline border-y bg-paper text-ink px-5 md:px-8"
      style={{ paddingBlock: 'clamp(4rem, 9vh, 7rem)' }}
    >
      <h2 className="sr-only">Stack and instrumentation.</h2>

      <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4 md:mb-12">
        <Readout text="INSTRUMENTATION / ROLLING CREDITS" className="text-ink-60" />
        <div className="flex items-baseline gap-6">
          <Readout text="04.5 / STACK" className="text-ink-40" delay={0.15} />
          {!reduced && (
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setExpanded((v) => !v)}
              className="type-readout cursor-pointer text-ink transition-opacity duration-300 hover:opacity-60"
            >
              {expanded ? '[ ROLL ]' : '[ EXPAND ]'}
            </button>
          )}
        </div>
      </div>

      {/* Screen readers always get the full flat list. */}
      <ul className="sr-only">
        {stackRows.map((row) => (
          <li key={row.label}>
            {row.label}: {row.items.join(', ')}
          </li>
        ))}
      </ul>

      <div
        aria-hidden="true"
        className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-5 lg:gap-x-8"
      >
        {stackRows.map((row, i) => (
          <div
            key={row.label}
            onMouseEnter={() => holdColumn(i, true)}
            onMouseLeave={() => holdColumn(i, false)}
          >
            <div className="hairline mb-5 border-b pb-2 text-center">
              <span className="type-readout text-ink">{row.label}</span>
            </div>

            {flat ? (
              <ul className="flex flex-col">
                {row.items.map((item) => (
                  <li
                    key={item}
                    className="py-1.5 text-center font-mono text-[0.8125rem] uppercase tracking-[0.06em] text-ink-60 transition-colors duration-300 hover:text-ink"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <div
                className={`overflow-hidden ${VIEWPORT_CLASS}`}
                style={{
                  maskImage: EDGE_MASK,
                  WebkitMaskImage: EDGE_MASK,
                }}
              >
                {/* Two copies; the loop resets invisibly at -50%. */}
                <div data-credits-track data-count={row.items.length}>
                  {[0, 1].map((copy) => (
                    <ul key={copy} className="flex flex-col">
                      {row.items.map((item) => (
                        <li
                          key={item}
                          className="py-1.5 text-center font-mono text-[0.8125rem] uppercase tracking-[0.06em] text-ink-60"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
