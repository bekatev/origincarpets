'use client';

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
 * Product/media images load from the original URL (Nest `/api/media/...` or nginx).
 * No opacity gate — cached images often skip `onLoad`, which previously left cards blank
 * until hover remounted a second image.
 */
export function OptimizedImg({
  src,
  alt,
  className = '',
  priority = false,
  draggable = false
}: OptimizedImgProps) {
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      draggable={draggable}
      className={className}
    />
  );
}
