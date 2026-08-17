'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { DecorationMotif } from '@/components/home/decoration-motif';
import { useI18n } from '@/components/providers/i18n-provider';
import { stockImages } from '@/lib/stock-images';

const SLIDES = [
  {
    src: stockImages.interiors.livingRed,
    alt: 'Red oriental carpet in a contemporary living room',
    /** Portrait — bias toward rug / seating */
    position: 'object-[center_45%]'
  },
  {
    src: stockImages.interiors.wallHanging,
    alt: 'Handmade carpet hung as wall art above a living room sofa',
    position: 'object-center'
  },
  {
    src: stockImages.interiors.roomsCollage,
    alt: 'Same carpet styled across living room, bedroom, and dining spaces',
    position: 'object-center'
  }
] as const;

const AUTO_MS = 5200;

function ArrowIcon({ direction }: { direction: 'prev' | 'next' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={direction === 'prev' ? 'M15 6 9 12l6 6' : 'M9 6l6 6-6 6'}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AtHomeSlider() {
  const { dict } = useI18n();
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((delta: number) => {
    setIndex((current) => (current + delta + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = window.setInterval(() => go(1), AUTO_MS);
    return () => window.clearInterval(id);
  }, [go, paused, reduceMotion, index]);

  return (
    <section id="at-home" className="relative scroll-mt-28 overflow-hidden bg-[var(--oc-bg)]">
      <DecorationMotif size="hero" placement="left" />
      <DecorationMotif size="xl" placement="bottom-right" opacity={0.24} />
      <div className="oc-container oc-section relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="oc-heading-sm">{dict.home.atHomeTitle}</h2>
          <p className="oc-body mx-auto mt-4 max-w-md">{dict.home.atHomeBody}</p>
        </div>

        <div
          className="relative mt-12 sm:mt-16"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setPaused(false);
            }
          }}
        >
          {/* Balanced frame works for both portrait & landscape sources */}
          <div className="relative aspect-[4/5] overflow-hidden bg-[var(--oc-paper)] sm:aspect-[3/2] lg:aspect-[16/9]">
            {SLIDES.map((slide, i) => (
              <div
                key={slide.src}
                className={`absolute inset-0 transition-opacity duration-700 ease-luxury ${
                  i === index ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
                aria-hidden={i !== index}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  priority={i === 0}
                  className={`object-cover ${slide.position}`}
                  sizes="(max-width: 1400px) 100vw, 1400px"
                  quality={75}
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-[var(--oc-ink)]/25 bg-[var(--oc-paper)] text-[var(--oc-ink)] shadow-sm transition hover:border-[var(--oc-ink)] sm:left-5 sm:h-12 sm:w-12"
            >
              <ArrowIcon direction="prev" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-[var(--oc-ink)]/25 bg-[var(--oc-paper)] text-[var(--oc-ink)] shadow-sm transition hover:border-[var(--oc-ink)] sm:right-5 sm:h-12 sm:w-12"
            >
              <ArrowIcon direction="next" />
            </button>
          </div>

          <div className="mt-7 flex items-center justify-center gap-3" role="tablist" aria-label="At Home slides">
            {SLIDES.map((item, i) => {
              const active = i === index;
              return (
                <button
                  key={item.src}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`Go to image ${i + 1} of ${SLIDES.length}`}
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all duration-500 ease-luxury ${
                    active
                      ? 'w-10 bg-[var(--oc-ink)]'
                      : 'w-2.5 bg-[var(--oc-ink)]/35 hover:bg-[var(--oc-ink)]/60'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
