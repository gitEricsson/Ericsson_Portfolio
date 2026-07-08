'use client';

import { useRef, useState } from 'react';
import { education, experience, type Engagement } from '@/content/profile';
import { gsap, useGSAP } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import ChapterHead from '@/components/shared/ChapterHead';
import Readout from '@/components/shared/Readout';

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function EngagementRow({
  item,
  open,
  onToggle,
}: {
  item: Engagement;
  open: boolean;
  onToggle: () => void;
}) {
  const id = slug(item.company);
  return (
    <div className="hairline border-t">
      <button
        type="button"
        id={`xp-btn-${id}`}
        aria-expanded={open}
        aria-controls={`xp-panel-${id}`}
        onClick={onToggle}
        className="grid w-full cursor-pointer grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-2 py-6 text-left transition-colors duration-200 md:grid-cols-12 md:gap-x-6 md:py-7"
      >
        <span className="type-sub col-span-1 flex items-baseline gap-3 md:col-span-5">
          {item.company}
        </span>
        <span className="type-readout col-start-1 row-start-2 text-ink-60 md:col-start-6 md:col-span-3 md:row-start-auto">
          {item.role}
        </span>
        <span className="col-start-1 row-start-3 md:col-start-9 md:col-span-2 md:row-start-auto">
          <span className="type-readout hairline inline-block border px-1.5 py-0.5 text-ink-60">
            {item.industry}
          </span>
        </span>
        <span className="type-readout col-start-2 row-start-1 text-right tabular-nums text-ink-40 md:col-start-11 md:col-span-1 md:row-start-auto">
          {item.year}
        </span>
        <span
          aria-hidden="true"
          className={`col-start-2 row-start-3 self-center text-right font-mono text-lg leading-none text-ink-40 transition-transform duration-300 ease-out md:col-start-12 md:col-span-1 md:row-start-auto ${
            open ? 'rotate-45' : ''
          }`}
        >
          +
        </span>
      </button>

      <div
        id={`xp-panel-${id}`}
        role="region"
        aria-labelledby={`xp-btn-${id}`}
        className="grid transition-[grid-template-rows] duration-500 motion-reduce:transition-none"
        style={{
          gridTemplateRows: open ? '1fr' : '0fr',
          transitionTimingFunction: 'var(--ease-out-quart)',
        }}
      >
        <div className="overflow-hidden">
          <div className="pb-8 md:grid md:grid-cols-12 md:gap-x-6">
            <p className="type-body max-w-[68ch] text-ink-60 md:col-start-6 md:col-span-7">
              {item.detail}
            </p>
            {item.links && (
              <ul className="mt-5 flex gap-5 md:col-start-6 md:col-span-7">
                {item.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="type-readout text-ink-60 transition-colors duration-300 hover:text-ink focus-visible:text-ink"
                    >
                      <span aria-hidden="true">[&nbsp;</span>
                      {link.label}
                      <span aria-hidden="true">&nbsp;]</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Chapter 03: the employment record. */
export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  // All rows closed until clicked; one open at a time.
  const [openId, setOpenId] = useState<string | null>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      gsap.utils
        .toArray<HTMLElement>('[data-xp-group]', sectionRef.current)
        .forEach((group) => {
          gsap.from(group.querySelectorAll('[data-xp-row]'), {
            opacity: 0,
            y: 22,
            duration: 0.8,
            ease: 'quart.out',
            stagger: 0.07,
            scrollTrigger: { trigger: group, start: 'top 85%', once: true },
          });
        });
    },
    { scope: sectionRef, dependencies: [reduced] },
  );

  return (
    <section
      id="experience"
      ref={sectionRef}
      data-polarity="dark"
      className="bg-paper text-ink py-[clamp(6rem,14vh,12rem)]"
    >
      <div className="px-5 md:px-8">
        <ChapterHead
          index="03"
          label="CAREER RECORD"
          title="EXPERIENCE"
          className="mb-10 md:mb-14"
        />
      </div>

      <div className="px-5 md:px-8">
        {experience.map((group, gi) => (
          <div
            key={group.label}
            data-xp-group
            className={gi === 0 ? '' : 'mt-16 md:mt-24'}
          >
            <div className="mb-5 flex items-baseline justify-between">
              <Readout text={group.label} className="text-ink" />
              <Readout
                text={`${String(group.items.length).padStart(2, '0')} ENTRIES`}
                className="text-ink-40"
              />
            </div>
            <div className="hairline border-b">
              {group.items.map((item) => {
                const id = slug(item.company);
                return (
                  <div data-xp-row key={id}>
                    <EngagementRow
                      item={item}
                      open={openId === id}
                      onToggle={() =>
                        setOpenId((cur) => (cur === id ? null : id))
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Education: one line, deliberately brief. */}
        <div data-xp-group className="mt-16 md:mt-24">
          <div className="mb-5 flex items-baseline justify-between">
            <Readout text="EDUCATION" className="text-ink" />
            <Readout text="01 ENTRY" className="text-ink-40" />
          </div>
          <div
            data-xp-row
            className="hairline grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-2 border-y py-6 md:grid-cols-12 md:gap-x-6 md:py-7"
          >
            <span className="type-sub col-span-1 md:col-span-5">
              {education.school}
            </span>
            <span className="type-readout col-start-1 row-start-2 text-ink-60 md:col-start-6 md:col-span-3 md:row-start-auto">
              {education.degree}
            </span>
            <span className="col-start-1 row-start-3 md:col-start-9 md:col-span-2 md:row-start-auto">
              <span className="type-readout hairline inline-block border px-1.5 py-0.5 text-ink-60">
                {education.industry}
              </span>
            </span>
            <span className="type-readout col-start-2 row-start-1 hidden text-right text-ink-40 md:col-start-11 md:col-span-2 md:row-start-auto lg:block">
              LAGOS, NG
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
