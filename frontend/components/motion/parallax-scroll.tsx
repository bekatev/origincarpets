'use client';

import { useReducedMotion, useScroll, useTransform, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Site-wide parallax depth: soft background layers drift slower than the page
 * content. Respects prefers-reduced-motion. Skipped on admin for denser UI.
 */
export function ParallaxScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();

  const layerFar = useTransform(scrollY, [0, 2400], [0, 320]);
  const layerMid = useTransform(scrollY, [0, 2400], [0, 160]);
  const layerNear = useTransform(scrollY, [0, 2400], [0, -100]);
  const motifY = useTransform(scrollY, [0, 2400], [0, 220]);
  const motifRotate = useTransform(scrollY, [0, 2400], [0, 12]);

  const showBackdrop = !reduceMotion && !isAdmin;

  return (
    <div className="relative min-h-screen">
      {showBackdrop && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
          <motion.div
            style={{ y: layerFar }}
            className="absolute -top-[18%] left-0 right-0 h-[62%] bg-[var(--oc-bg-secondary)] opacity-[0.55]"
          />
          <motion.div
            style={{ y: layerMid }}
            className="absolute top-[28%] -right-[18%] h-[55vmax] w-[55vmax] rounded-full bg-[var(--oc-paper)] opacity-40 blur-3xl"
          />
          <motion.div
            style={{ y: layerNear }}
            className="absolute top-[58%] -left-[22%] h-[48vmax] w-[48vmax] rounded-full bg-[var(--oc-bg-secondary)] opacity-35 blur-3xl"
          />
          <motion.div
            style={{ y: motifY, rotate: motifRotate }}
            className="absolute left-1/2 top-[42%] h-[min(420px,55vw)] w-[min(420px,55vw)] -translate-x-1/2 opacity-[0.045] dark:opacity-[0.06]"
          >
            {/* Decorative ring — CSS only, no asset fetch */}
            <div className="h-full w-full rounded-full border border-[var(--oc-ink)]" />
            <div className="absolute inset-[18%] rounded-full border border-[var(--oc-ink)] opacity-70" />
            <div className="absolute inset-[36%] rounded-full border border-[var(--oc-ink)] opacity-40" />
          </motion.div>
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
