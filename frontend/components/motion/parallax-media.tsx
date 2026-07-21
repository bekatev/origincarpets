'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/cn';

/**
 * Soft vertical parallax for section media (hero carpets, editorial photos).
 * Expands the layer slightly so travel never reveals empty edges.
 */
export function ParallaxMedia({
  children,
  className,
  intensity = 100,
  enabled = true
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
  enabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();
  const active = enabled && !reduceMotion;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });
  const y = useTransform(scrollYProgress, [0, 1], [intensity, -intensity]);

  return (
    <div ref={ref} className={cn('absolute inset-0 overflow-hidden', className)}>
      <motion.div
        className="absolute inset-x-0 -top-[16%] -bottom-[16%] will-change-transform"
        style={active ? { y } : undefined}
      >
        {children}
      </motion.div>
    </div>
  );
}

/** Gentle rise for foreground content as a section enters view. */
export function ParallaxContent({
  children,
  className,
  intensity = 36
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });
  const y = useTransform(scrollYProgress, [0, 1], [intensity, -intensity * 0.35]);

  return (
    <motion.div
      ref={ref}
      className={cn('relative will-change-transform', className)}
      style={reduceMotion ? undefined : { y }}
    >
      {children}
    </motion.div>
  );
}
