'use client';

import { useRef, type ReactNode } from 'react';
import { useReducedMotion, useScroll, useTransform, motion } from 'framer-motion';
import { cn } from '@/lib/cn';

export function ParallaxMedia({
  children,
  className,
  intensity = 56
}: {
  children: ReactNode;
  className?: string;
  /** Vertical travel in px from bottom→top of viewport */
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [intensity, -intensity]);

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div ref={ref} style={{ y }} className={cn('will-change-transform', className)}>
      {children}
    </motion.div>
  );
}
