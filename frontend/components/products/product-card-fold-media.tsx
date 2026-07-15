'use client';

import { useCallback, useMemo, useState, type MouseEvent } from 'react';

type ProductCardFoldMediaProps = {
  images: string[];
  alt: string;
  priority?: boolean;
  className?: string;
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

export function ProductCardFoldMedia({
  images,
  alt,
  priority = false,
  className = ''
}: ProductCardFoldMediaProps) {
  const slides = useMemo(() => images.filter(Boolean), [images]);
  const [index, setIndex] = useState(0);
  const safeIndex = slides.length ? index % slides.length : 0;
  const src = slides[safeIndex];
  const hasMultiple = slides.length > 1;

  const go = useCallback(
    (delta: number) => (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!slides.length) return;
      setIndex((current) => (current + delta + slides.length) % slides.length);
    },
    [slides.length]
  );

  if (!src) {
    return (
      <div
        className={`relative aspect-square bg-[var(--oc-bg-secondary)] ${className}`}
        aria-label={alt}
      />
    );
  }

  return (
    <div
      className={`product-reveal group/media relative aspect-square overflow-hidden bg-[var(--oc-bg-secondary)] ${className}`}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
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
      </div>

      <div className="product-reveal__panel absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="product-reveal__panel-inner h-full w-full bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${src}")`, backgroundColor: 'var(--oc-bg-secondary)' }}
        />
      </div>

      {hasMultiple ? (
        <>
          <button
            type="button"
            onClick={go(-1)}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--oc-line)] bg-[var(--oc-paper)]/90 text-[var(--oc-ink)] opacity-90 shadow-sm backdrop-blur-sm transition duration-300 hover:bg-[var(--oc-paper)] md:opacity-0 md:group-hover/media:opacity-100 focus-visible:opacity-100"
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            onClick={go(1)}
            aria-label="Next image"
            className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--oc-line)] bg-[var(--oc-paper)]/90 text-[var(--oc-ink)] opacity-90 shadow-sm backdrop-blur-sm transition duration-300 hover:bg-[var(--oc-paper)] md:opacity-0 md:group-hover/media:opacity-100 focus-visible:opacity-100"
          >
            <Chevron direction="right" />
          </button>
          <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1 opacity-0 transition duration-300 group-hover/media:opacity-100">
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
