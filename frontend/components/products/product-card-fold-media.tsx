'use client';

import Image from 'next/image';
import { useMemo } from 'react';

type ProductCardFoldMediaProps = {
  images: string[];
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

export function ProductCardFoldMedia({
  images,
  alt,
  sizes,
  priority = false,
  className = ''
}: ProductCardFoldMediaProps) {
  const slides = useMemo(() => images.filter(Boolean), [images]);
  const src = slides[0];

  if (!src) {
    return (
      <div
        className={`relative aspect-[4/5] bg-[var(--oc-bg-secondary)] ${className}`}
        aria-label={alt}
      />
    );
  }

  return (
    <div
      className={`product-reveal relative aspect-[4/5] overflow-hidden bg-[var(--oc-bg-secondary)] ${className}`}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 scale-110">
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            className="object-cover"
            sizes={sizes}
          />
        </div>
      </div>

      <div className="product-reveal__panel absolute inset-0 overflow-hidden">
        <div className="product-reveal__panel-inner relative h-full w-full">
          <Image src={src} alt="" fill className="object-cover" sizes={sizes} aria-hidden />
        </div>
      </div>
    </div>
  );
}
