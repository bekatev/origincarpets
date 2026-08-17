'use client';

import { useCallback, useState } from 'react';
import { cn } from '@/lib/cn';

type OptimizedImgProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Kept for call-site compatibility — product media bypasses /_next/image. */
  maxWidth?: number;
  /** Kept for call-site compatibility — product media bypasses /_next/image. */
  quality?: number;
  draggable?: boolean;
};

/**
 * Product/media images are often served by Nest (`/api/media/...`) or nginx at the
 * site root. Next’s `/_next/image` optimizer cannot fetch those internally, so we
 * load the original URL directly (lazy + fade-in + error visibility).
 *
 * Static assets under /stock, /brand, /guests, /staff still go through next/image
 * where callers use the next/image component themselves.
 */
export function OptimizedImg({
  src,
  alt,
  className = '',
  priority = false,
  draggable = false
}: OptimizedImgProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const onError = useCallback(() => {
    setFailed(true);
    setLoaded(true);
  }, []);

  return (
    <img
      src={src}
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
        failed && 'opacity-40',
        className
      )}
    />
  );
}
