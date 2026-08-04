'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { CarpetBackdrop } from '@/components/home/carpet-backdrop';
import { DecorationDivider } from '@/components/home/decoration-divider';
import { useI18n } from '@/components/providers/i18n-provider';
import {
  aboutMediaItems,
  facebookEmbedSrc,
  type AboutMediaItem,
  type MediaOrientation
} from '@/lib/about-media';
import { cn } from '@/lib/cn';
import { stockImages } from '@/lib/stock-images';

const PORTRAIT = { width: 320, height: 568 };
const LANDSCAPE = { width: 720, height: 405 };

/**
 * Facebook player must stay clickable (play + scrub).
 * No overlays on the iframe. Landscape uses a matching 16:9 box
 * (no CSS transform — transforms break hit-testing on the seek bar).
 */
function FacebookEmbed({
  href,
  orientation,
  title
}: {
  href: string;
  orientation: MediaOrientation;
  title: string;
}) {
  const isLandscape = orientation === 'landscape';
  const size = isLandscape ? LANDSCAPE : PORTRAIT;

  if (isLandscape) {
    return (
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <iframe
          title={title}
          src={facebookEmbedSrc(href, size)}
          className="absolute inset-0 h-full w-full border-0"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto w-full overflow-hidden bg-black"
      style={{ maxWidth: size.width, aspectRatio: `${size.width} / ${size.height}` }}
    >
      <iframe
        title={title}
        src={facebookEmbedSrc(href, size)}
        className="absolute inset-0 h-full w-full border-0"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}

function MediaFrame({
  item,
  index,
  label,
  openLabel,
  tvEyebrow,
  tvBody,
  watchLabel,
  locale
}: {
  item: AboutMediaItem;
  index: number;
  label: string;
  openLabel: string;
  tvEyebrow: string;
  tvBody: string;
  watchLabel: string;
  locale: string;
}) {
  const reduceMotion = useReducedMotion();
  const n = String(index + 1).padStart(2, '0');
  const isLandscape = item.orientation === 'landscape';

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.04, 0.2) }}
      className="relative w-full"
    >
      <div
        className={cn(
          'relative overflow-hidden bg-[var(--oc-ink)] shadow-[var(--oc-shadow-lift)] ring-1 ring-[var(--oc-ink)]/10',
          isLandscape ? 'mx-auto w-full max-w-[720px]' : 'mx-auto w-full max-w-[320px]'
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-3">
          <span className="rounded-sm bg-[var(--oc-bg)]/90 px-2 py-1 font-display text-[11px] tracking-[0.14em] text-[var(--oc-ink)] backdrop-blur-sm">
            {n}
          </span>
          <span className="rounded-sm bg-[var(--oc-ink)]/70 px-2 py-1 text-[9px] font-medium uppercase tracking-[0.2em] text-[var(--oc-bg)] backdrop-blur-sm">
            {item.kind === 'ajaratv' ? tvEyebrow : label}
          </span>
        </div>

        {item.kind === 'facebook' ? (
          <>
            <FacebookEmbed href={item.href} orientation={item.orientation} title={`${label} ${n}`} />
            <div className="border-t border-white/10 bg-[var(--oc-ink)] px-3.5 py-2.5 text-center">
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--oc-bg)]/85 hover:text-[var(--oc-bg)]"
              >
                {openLabel} ↗
              </a>
            </div>
          </>
        ) : (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block aspect-video w-full overflow-hidden"
          >
            <Image
              src={item.poster}
              alt={locale === 'ka' ? item.titleKa : item.titleEn}
              fill
              className="object-cover object-center transition duration-700 hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 720px"
              priority={index < 3}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--oc-ink)]/90 via-[var(--oc-ink)]/45 to-[var(--oc-ink)]/15" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center text-[var(--oc-bg)] sm:px-10">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--oc-bg)]/45 bg-[var(--oc-ink)]/35 backdrop-blur-md">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M8 5.14v13.72L19 12 8 5.14z" />
                </svg>
              </span>
              <div>
                <p className="font-display text-2xl leading-tight sm:text-3xl">
                  {locale === 'ka' ? item.titleKa : item.titleEn}
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm text-[var(--oc-bg)]/80">{tvBody}</p>
              </div>
              <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--oc-bg)]/95">
                {watchLabel} →
              </span>
            </div>
          </a>
        )}
      </div>
    </motion.article>
  );
}

export function AboutPageContent() {
  const { dict, locale } = useI18n();
  const copy = dict.aboutPage;
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, reduceMotion ? 1 : 0.35]);

  return (
    <main>
      {/* Compact cinematic hero */}
      <section ref={heroRef} className="relative overflow-hidden py-14 sm:py-16 lg:py-20">
        <CarpetBackdrop
          src={stockImages.carpets.jewel}
          tone="ink"
          strength={0.62}
          intensity={70}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--oc-ink)]/25 via-transparent to-[var(--oc-bg)]" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="oc-container relative">
          <div className="mx-auto max-w-3xl text-center text-white">
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[11px] font-medium uppercase tracking-[0.32em] text-white/70"
            >
              {copy.eyebrow}
            </motion.p>
            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.06 }}
              className="mt-5 font-display text-[1.85rem] leading-[1.15] tracking-[-0.02em] text-white sm:text-4xl lg:text-[2.75rem]"
            >
              {copy.title}
            </motion.h1>
          </div>
        </motion.div>
      </section>

      <DecorationDivider />

      {/* Media gallery — tight, orientation-aware */}
      <section className="relative overflow-hidden py-10 sm:py-12 lg:py-14">
        <CarpetBackdrop
          src={stockImages.carpets.column}
          tone="paper"
          strength={0.42}
          intensity={50}
          parallax={false}
        />
        <div className="oc-container relative">
          <div className="mb-8 text-center sm:mb-10">
            <p className="oc-eyebrow">{copy.galleryEyebrow}</p>
            <h2 className="mt-2 font-display text-2xl text-[var(--oc-ink)] sm:text-3xl">
              {copy.galleryTitle}
            </h2>
          </div>

          <div className="mx-auto flex max-w-3xl flex-col items-center gap-10 sm:gap-12">
            {aboutMediaItems.map((item, index) => (
              <MediaFrame
                key={item.id}
                item={item}
                index={index}
                label={copy.facebookEmbedLabel}
                openLabel={copy.openOnFacebook}
                tvEyebrow={copy.tvEyebrow}
                tvBody={copy.tvBody}
                watchLabel={copy.watchOnAdjara}
                locale={locale}
              />
            ))}
          </div>
        </div>
      </section>

      <DecorationDivider />
    </main>
  );
}
