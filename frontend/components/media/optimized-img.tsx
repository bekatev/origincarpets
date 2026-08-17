'use client';

import { useCallback, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';

const WIDTH_BUCKETS = [256, 384, 640, 750, 828, 1080, 1200, 1920] as const;

type OptimizedImgProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Cap the largest srcset width (cards ~640, detail ~1200). */
  maxWidth?: number;
  quality?: number;
  draggable?: boolean;
};

function canOptimize(src: string) {
  if (!src || src.startsWith('data:') || src.startsWith('blob:')) return false;
  // Relative site paths and same-host product media go through /_next/image.
  if (src.startsWith('/')) return true;
  try {
    const host = new URL(src).hostname;
    return host === 'origincarpets.com' || host === 'www.origincarpets.com';
  } catch {
    return false;
  }
}

function optimizedUrl(src: string, width: number, quality: number) {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}

/**
 * Responsive product/media image: serves WebP/AVIF via Next’s optimizer when
 * possible, falls back to the original URL if optimization fails (legacy nginx files).
 */
export function OptimizedImg({
  src,
  alt,
  className = '',
  sizes = '100vw',
  priority = false,
  maxWidth = 1200,
  quality = 72,
  draggable = false
}: OptimizedImgProps) {
  const [mode, setMode] = useState<'optimized' | 'original'>('optimized');
  const [loaded, setLoaded] = useState(false);

  const useOptimizer = mode === 'optimized' && canOptimize(src);

  const widths = useMemo(
    () => WIDTH_BUCKETS.filter((w) => w <= maxWidth),
    [maxWidth]
  );

  const srcSet = useMemo(() => {
    if (!useOptimizer || !widths.length) return undefined;
    return widths.map((w) => `${optimizedUrl(src, w, quality)} ${w}w`).join(', ');
  }, [useOptimizer, widths, src, quality]);

  const currentSrc = useOptimizer
    ? optimizedUrl(src, widths[widths.length - 1] ?? maxWidth, quality)
    : src;

  const onError = useCallback(() => {
    if (mode === 'optimized') {
      setLoaded(false);
      setMode('original');
      return;
    }
    // Original failed too — stop staying invisible forever.
    setLoaded(true);
  }, [mode]);

  return (
    <img
      key={`${src}-${mode}`}
      src={currentSrc}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      draggable={draggable}
      onLoad={() => setLoaded(true)}
      onError={onError}
      className={cn(
        'transition-opacity duration-500 ease-out',
        loaded ? 'opacity-100' : 'opacity-0',
        className
      )}
    />
  );
}
