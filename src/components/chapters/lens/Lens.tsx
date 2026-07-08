'use client';

import { useEffect, useRef, useState } from 'react';
import { gallery, type GalleryItem } from '@/content/gallery';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import ChapterHead from '@/components/shared/ChapterHead';
import Readout from '@/components/shared/Readout';
import SplitReveal from '@/components/shared/SplitReveal';
import Magnetic from '@/components/shared/Magnetic';

function pad(n: number): string {
  return String(n).padStart(3, '0');
}

function FrameMedia({ item }: { item: GalleryItem }) {
  if (item.kind === 'video') {
    return (
      <video
        data-lens-media
        data-lens-video
        className="frame-media -ml-[5%] h-full w-[110%] max-w-none object-cover"
        src={item.src}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={item.alt}
      />
    );
  }
  return (
    <img
      data-lens-media
      className="frame-media -ml-[5%] h-full w-[110%] max-w-none object-cover"
      src={item.src}
      alt={item.alt}
      loading="lazy"
      decoding="async"
    />
  );
}

/**
 * Chapter 05: commercial modeling contact sheet, horizontally pinned on
 * desktop. Frames sit under the site's monochrome plus a dark wash;
 * hovering (or centering, on touch) develops the true color.
 */
export default function Lens() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    const update = () => setDesktop(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  // Reduced motion always gets the static vertical stack, even on desktop.
  const horizontal = desktop && !reduced && gallery.length > 0;
  const totalPlates = gallery.length + 1; // frames plus the terminal plate

  // Videos play only while on screen; touch devices develop color in view.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const finePointer = window.matchMedia('(pointer: fine)').matches;

    const videos = Array.from(
      section.querySelectorAll<HTMLVideoElement>('[data-lens-video]'),
    );
    const videoIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && !reduced) {
            video.play().catch(() => undefined);
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.3 },
    );
    videos.forEach((v) => videoIO.observe(v));

    let litIO: IntersectionObserver | undefined;
    if (!finePointer) {
      const figures = Array.from(
        section.querySelectorAll<HTMLElement>('[data-lens-frame]'),
      );
      litIO = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            entry.target.setAttribute(
              'data-lit',
              entry.intersectionRatio >= 0.6 ? 'true' : 'false',
            );
          });
        },
        { threshold: [0.6, 0.59] },
      );
      figures.forEach((f) => litIO?.observe(f));
    }

    return () => {
      videoIO.disconnect();
      litIO?.disconnect();
    };
  }, [reduced]);

  useGSAP(
    () => {
      if (reduced || gallery.length === 0) return;

      // Develop reveal: frames arrive overexposed and out of focus, then fix.
      // Filters live on the wrapper so they never fight the color-reveal
      // transition on the media element itself.
      const wraps = gsap.utils.toArray<HTMLElement>(
        '[data-develop]',
        sectionRef.current,
      );
      gsap.set(wraps, { filter: 'brightness(1.9) blur(8px)', scale: 1.06 });
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            io.unobserve(entry.target);
            gsap.to(entry.target, {
              filter: 'brightness(1) blur(0px)',
              scale: 1,
              duration: 1.3,
              ease: 'expo.out',
            });
          });
        },
        { threshold: 0.2 },
      );
      wraps.forEach((wrap) => io.observe(wrap));

      if (horizontal && pinRef.current && trackRef.current) {
        const track = trackRef.current;
        const distance = () =>
          Math.max(1, track.scrollWidth - window.innerWidth);

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: pinRef.current,
            start: 'top top',
            end: () => '+=' + distance(),
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const el = counterRef.current;
              if (!el) return;
              const idx = Math.min(
                totalPlates,
                1 + Math.round(self.progress * (totalPlates - 1)),
              );
              el.textContent = `${pad(idx)} / ${pad(totalPlates)}`;
            },
          },
        });
        tl.to(track, { x: () => -distance() }, 0);
        // Inner parallax: media counter-drifts inside its overflow-hidden
        // mount. The 110% width leaves slack so edges never show.
        const media = gsap.utils.toArray<HTMLElement>(
          '[data-lens-media]',
          track,
        );
        if (media.length > 0) {
          tl.fromTo(media, { xPercent: -3.5 }, { xPercent: 3.5 }, 0);
        }
        // The pin spacer changes document height after initial layout.
        ScrollTrigger.refresh();
      }

      return () => io.disconnect();
    },
    { scope: sectionRef, dependencies: [reduced, horizontal] },
  );

  return (
    <section
      ref={sectionRef}
      id="lens"
      data-polarity="dark"
      className="bg-paper text-ink pt-[clamp(6rem,14vh,12rem)]"
    >
      {/* Local styles: monochrome wash lifts on hover (or in view on touch). */}
      <style>{`
        .frame-media {
          filter: grayscale(1) contrast(1.06);
          transition: filter 0.6s var(--ease-out-quart);
        }
        .frame-overlay {
          position: absolute;
          inset: 0;
          background: color-mix(in oklab, #111114 42%, transparent);
          transition: opacity 0.6s var(--ease-out-quart);
          pointer-events: none;
        }
        @media (pointer: fine) {
          [data-lens-frame]:hover .frame-media,
          [data-lens-frame]:focus-within .frame-media {
            filter: grayscale(0) contrast(1);
          }
          [data-lens-frame]:hover .frame-overlay,
          [data-lens-frame]:focus-within .frame-overlay {
            opacity: 0;
          }
        }
        [data-lens-frame][data-lit='true'] .frame-media {
          filter: grayscale(0) contrast(1);
        }
        [data-lens-frame][data-lit='true'] .frame-overlay {
          opacity: 0;
        }
        @media (prefers-reduced-motion: reduce) {
          .frame-media,
          .frame-overlay {
            transition: none;
          }
        }
      `}</style>

      <div
        className={`px-5 md:px-8 ${
          gallery.length === 0 ? 'pb-[clamp(6rem,14vh,12rem)]' : ''
        }`}
      >
        <ChapterHead
          index="05"
          label="COMMERCIAL WORK"
          title="LENS"
          className="mb-8 md:mb-10"
        />
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
          <SplitReveal as="p" className="type-body max-w-[52ch] text-ink-60">
            Commercial model. Editorial, campaign and street, shot in Lagos.
            The frames idle in the site&apos;s monochrome; light one up to see
            it as the camera did.
          </SplitReveal>
          <div className="flex shrink-0 flex-col gap-1 md:items-end">
            <Readout text="FILM + DIGITAL / LAGOS" className="text-ink-40" />
            <Readout
              text="HOVER TO DEVELOP COLOR"
              className="text-ink-60"
              delay={0.12}
            />
          </div>
        </div>
      </div>

      {gallery.length > 0 && (
        <div
          ref={pinRef}
          className={
            horizontal
              ? 'relative mt-10 h-svh overflow-hidden md:mt-14'
              : 'mt-10 px-5 pb-[clamp(6rem,14vh,12rem)] md:mt-14 md:px-8'
          }
        >
          <div
            ref={trackRef}
            className={
              horizontal
                ? 'flex h-full w-max items-center gap-10 pl-5 pr-5 will-change-transform md:pl-8 md:pr-8 lg:gap-16 lg:pl-[10vw] lg:pr-[10vw]'
                : 'flex flex-col gap-14 md:gap-20'
            }
          >
            {gallery.map((item, i) => (
              <figure
                key={item.src}
                data-lens-frame
                className={
                  horizontal ? 'shrink-0' : 'mx-auto w-full max-w-[560px]'
                }
                style={
                  horizontal
                    ? { width: `calc(62svh * ${item.ratio})` }
                    : undefined
                }
              >
                <div
                  className={`relative ${
                    horizontal ? 'h-[62svh] w-full' : 'w-full'
                  }`}
                  style={{ aspectRatio: String(item.ratio) }}
                >
                  <div data-develop className="h-full w-full overflow-hidden">
                    <FrameMedia item={item} />
                  </div>
                  <div className="frame-overlay" aria-hidden="true" />
                </div>
                <figcaption className="mt-3 flex items-baseline justify-between gap-4">
                  <span className="type-readout text-ink-60">
                    {`FRAME ${String(i + 1).padStart(2, '0')} / ${item.caption}`}
                  </span>
                  <span className="type-readout shrink-0 text-ink-40">
                    {`${pad(i + 1)} / ${pad(gallery.length)}`}
                  </span>
                </figcaption>
              </figure>
            ))}

            {/* Terminal plate: the booking call. */}
            <div
              className={
                horizontal
                  ? 'hairline flex h-[62svh] shrink-0 flex-col items-center justify-center gap-6 border bg-black'
                  : 'hairline mx-auto flex aspect-[3/4] w-full max-w-[560px] flex-col items-center justify-center gap-6 border bg-black'
              }
              style={horizontal ? { width: 'calc(62svh * 0.733)' } : undefined}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <Readout text="NEXT CAMPAIGN" className="text-ink-60" />
                <Readout text="FILM OR DIGITAL" className="text-ink-40" />
              </div>
              <div className="flex flex-col items-center gap-3">
                <Magnetic>
                  <a
                    href="mailto:ericssonraphael@gmail.com"
                    className="type-readout group inline-flex items-baseline gap-2 text-ink"
                  >
                    <span
                      aria-hidden="true"
                      className="text-ink-40 transition-colors duration-300 group-hover:text-ink"
                    >
                      [
                    </span>
                    BOOK ERICSSON -&gt;
                    <span
                      aria-hidden="true"
                      className="text-ink-40 transition-colors duration-300 group-hover:text-ink"
                    >
                      ]
                    </span>
                  </a>
                </Magnetic>
                <Magnetic>
                  <a
                    href="https://www.instagram.com/ericssonraphael"
                    target="_blank"
                    rel="noreferrer"
                    className="type-readout group inline-flex items-baseline gap-2 text-ink-60 transition-colors duration-300 hover:text-ink"
                  >
                    <span aria-hidden="true" className="text-ink-40">
                      [
                    </span>
                    INSTAGRAM
                    <span aria-hidden="true" className="text-ink-40">
                      ]
                    </span>
                  </a>
                </Magnetic>
              </div>
            </div>
          </div>

          {horizontal && (
            <span
              ref={counterRef}
              aria-hidden="true"
              className="type-readout absolute bottom-6 left-1/2 -translate-x-1/2 text-ink-60"
            >
              {`001 / ${pad(totalPlates)}`}
            </span>
          )}
        </div>
      )}
    </section>
  );
}
