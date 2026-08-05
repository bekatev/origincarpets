'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Static media frame (parallax removed for performance).
 * Keeps the same absolute-fill layout ParallaxMedia used to provide.
 */
export function ParallaxMedia({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
  enabled?: boolean;
}) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}

/** Static section content wrapper (parallax removed for performance). */
export function ParallaxContent({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  return <div className={cn('relative', className)}>{children}</div>;
}
