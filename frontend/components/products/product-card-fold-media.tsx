'use client';

import { useCallback, useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type ProductCardFoldMediaProps = {
  images: string[];
  alt: string;
  priority?: boolean;
  className?: string;
  /** Overlay badge (Sold / −%) pinned to the image frame. */
  badge?: ReactNode;
};

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {direction === 'left' ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  );
}

function uniqueImages(images: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const url of images) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    result.push(url);
  }
  return result;
}

export function ProductCardFoldMedia({
  images,
  alt,
  priority = false,
  className = '',
  badge
}: ProductCardFoldMediaProps) {
  const slides = useMemo(() => uniqueImages(images), [images]);
  const [index, setIndex] = useState(0);
  /** After arrow navigation, keep the new slide at rest size until pointer leaves. */
  const [browsing, setBrowsing] = useState(false);
  const safeIndex = slides.length ? index % slides.length : 0;
  const src = slides[safeIndex];
  const hasMultiple = slides.length > 1;

  const go = useCallback(
    (delta: number) => (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (slides.length < 2) return;
      setBrowsing(true);
      setIndex((current) => (current + delta + slides.length) % slides.length);
    },
    [slides.length]
  );

  if (!src) {
    return (
      <div
        className={cn(
          'relative aspect-square min-h-[12rem] w-full overflow-hidden bg-[var(--oc-bg-secondary)]',
          className
        )}
        aria-label={alt}
      />
    );
  }

  return (
    <div
      className={cn(
        'product-reveal group/media relative aspect-square min-h-[12rem] w-full overflow-hidden bg-[var(--oc-bg-secondary)]',
        browsing && 'product-reveal--browsing',
        className
      )}
      onMouseLeave={() => setBrowsing(false)}
    >
      {badge ? (
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">{badge}</div>
      ) : null}

      <div className="absolute inset-0 z-0 overflow-hidden p-2 sm:p-3">
        {/* Native img — legacy product files are served by nginx at the site root, not via /_next/image */}
        <img
          key={src}
          src={src}
          alt={alt}
          loading={priority && safeIndex === 0 ? 'eager' : 'lazy'}
          decoding="async"
          className="h-full w-full object-contain"
        />
      </div>

      {/* Hover panel: same full carpet + tiny zoom (not bg-cover crop). */}
      <div
        className="product-reveal__panel absolute inset-0 z-[1] overflow-hidden bg-[var(--oc-bg-secondary)]"
        aria-hidden
      >
        <div className="product-reveal__panel-inner h-full w-full p-2 sm:p-3">
          <img src={src} alt="" className="h-full w-full object-contain" />
        </div>
      </div>

      {hasMultiple ? (
        <>
          <button
            type="button"
            onClick={go(-1)}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--oc-line)] bg-[var(--oc-paper)]/90 text-[var(--oc-ink)] opacity-90 shadow-sm backdrop-blur-sm transition duration-300 hover:bg-[var(--oc-paper)] md:opacity-0 md:group-hover/media:opacity-100 focus-visible:opacity-100"
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            onClick={go(1)}
            aria-label="Next image"
            className="absolute right-2 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--oc-line)] bg-[var(--oc-paper)]/90 text-[var(--oc-ink)] opacity-90 shadow-sm backdrop-blur-sm transition duration-300 hover:bg-[var(--oc-paper)] md:opacity-0 md:group-hover/media:opacity-100 focus-visible:opacity-100"
          >
            <Chevron direction="right" />
          </button>
          <div className="pointer-events-none absolute bottom-2 left-1/2 z-30 flex -translate-x-1/2 gap-1 opacity-0 transition duration-300 group-hover/media:opacity-100">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === safeIndex ? 'w-3 bg-[var(--oc-ink)]' : 'w-1 bg-[var(--oc-ink)]/35'
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
