"use client";

import { useRef } from "react";
import { projects } from "@/content/profile";
import ChapterHead from "@/components/shared/ChapterHead";
import Magnetic from "@/components/shared/Magnetic";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

export default function Works() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      gsap.from("[data-row]", {
        opacity: 0,
        y: 24,
        stagger: 0.06,
        duration: 0.8,
        ease: "quart.out",
        scrollTrigger: {
          trigger: "[data-rows]",
          start: "top 82%",
          once: true,
        },
      });
    },
    { scope: sectionRef, dependencies: [reduced] }
  );

  return (
    <section
      id="works"
      ref={sectionRef}
      data-polarity="light"
      className="relative bg-paper text-ink px-5 md:px-8 py-[clamp(6rem,14vh,12rem)]"
    >
      <ChapterHead
        index="04"
        label="SELECTED BUILDS"
        title="WORKS"
        align="right"
      />

      <div data-rows className="mt-[clamp(3rem,7vh,5rem)]">
        {projects.map((p, i) => (
          <a
            key={p.index}
            data-row
            href={p.href}
            target="_blank"
            rel="noreferrer"
            className={`hairline group grid grid-cols-[auto_1fr_auto] items-baseline gap-x-4 border-t py-6 transition-colors duration-200 hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper md:grid-cols-12 md:gap-x-6 md:py-8 ${
              i === projects.length - 1 ? "border-b" : ""
            }`}
          >
            <span className="type-readout col-span-1 text-ink-40 transition-colors duration-200 group-hover:text-paper">
              {p.index}
            </span>
            <span className="type-sub col-span-1 transition-transform duration-300 ease-out group-hover:translate-x-3 md:col-span-4">
              {p.title}
            </span>
            <span className="type-readout col-start-2 col-span-1 mt-2 flex flex-col gap-1 text-ink-60 transition-colors duration-200 group-hover:text-paper md:col-start-auto md:col-span-3 md:mt-0">
              <span>{p.category}</span>
              <span className="text-ink-40 transition-colors duration-200 group-hover:text-paper">
                {p.stack}
              </span>
            </span>
            <span className="col-span-3 hidden max-w-xs text-sm leading-relaxed text-ink-60 transition-colors duration-200 group-hover:text-paper lg:block">
              {p.metric}
            </span>
            <span className="type-readout col-start-3 row-start-1 text-right md:col-start-12 md:col-span-1">
              {p.year}
            </span>
          </a>
        ))}
      </div>

      <div className="mt-14 flex justify-end">
        <Magnetic>
          <a
            href="https://github.com/gitEricsson"
            target="_blank"
            rel="noreferrer"
            className="type-readout group relative inline-block"
          >
            FULL ARCHIVE / GITHUB {"->"}
            <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-ink transition-transform duration-300 ease-out group-hover:origin-left group-hover:scale-x-100" />
          </a>
        </Magnetic>
      </div>
    </section>
  );
}
