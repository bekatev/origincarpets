'use client';

import { useEffect, useRef, useState } from 'react';
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

/** Native Facebook plugin sizes — must match iframe attrs + embed URL exactly. */
const PORTRAIT = { width: 320, height: 568 };
const LANDSCAPE = { width: 720, height: 405 };

/**
 * Scales the Facebook plugin with CSS transform so the video never stretches.
 * Stretching an iframe with width/height 100% is what caused the distortion.
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
  const size = orientation === 'landscape' ? LANDSCAPE : PORTRAIT;
  const shellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    const update = () => {
      const available = el.clientWidth;
      if (available <= 0) return;
      setScale(Math.min(1, available / size.width));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size.width]);

  return (
    <div
      ref={shellRef}
      className="relative mx-auto w-full overflow-hidden bg-black"
      style={{
        maxWidth: size.width,
        height: Math.round(size.height * scale)
      }}
    >
      <iframe
        title={title}
        src={facebookEmbedSrc(href, size)}
        width={size.width}
        height={size.height}
        className="absolute left-0 top-0 border-0"
        style={{
          width: size.width,
          height: size.height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left'
        }}
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        loading="lazy"
        scrolling="no"
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
      className="group relative w-full"
    >
      <div
        className={cn(
          'relative overflow-hidden bg-[var(--oc-ink)] shadow-[var(--oc-shadow-lift)] ring-1 ring-[var(--oc-ink)]/10 transition duration-500 ease-[var(--oc-ease)]',
          'hover:-translate-y-0.5 hover:shadow-[0_28px_60px_-28px_rgba(52,40,39,0.45)]',
          isLandscape ? 'mx-auto w-full max-w-[720px]' : 'mx-auto w-full max-w-[320px]'
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-3">
          <span className="rounded-sm bg-[var(--oc-bg)]/90 px-2 py-1 font-display text-[11px] tracking-[0.14em] text-[var(--oc-ink)] backdrop-blur-sm">
            {n}
          </span>
          <span className="rounded-sm bg-[var(--oc-ink)]/70 px-2 py-1 text-[9px] font-medium uppercase tracking-[0.2em] text-[var(--oc-bg)] backdrop-blur-sm">
            {item.kind === 'ajaratv' ? tvEyebrow : label}
          </span>
        </div>

        {item.kind === 'facebook' ? (
          <FacebookEmbed href={item.href} orientation={item.orientation} title={`${label} ${n}`} />
        ) : (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block aspect-video w-full overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-[1.04]"
              style={{ backgroundImage: `url(${stockImages.about})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--oc-ink)] via-[var(--oc-ink)]/55 to-[var(--oc-ink)]/20" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center text-[var(--oc-bg)] sm:px-10">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--oc-bg)]/40 bg-[var(--oc-bg)]/10 backdrop-blur-md transition group-hover:scale-110 group-hover:bg-[var(--oc-bg)]/20">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M8 5.14v13.72L19 12 8 5.14z" />
                </svg>
              </span>
              <div>
                <p className="font-display text-2xl leading-tight sm:text-3xl">
                  {locale === 'ka' ? item.titleKa : item.titleEn}
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm text-[var(--oc-bg)]/75">{tvBody}</p>
              </div>
              <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--oc-bg)]/90">
                {watchLabel} →
              </span>
            </div>
          </a>
        )}

        {item.kind === 'facebook' ? (
          <>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden translate-y-1 items-center justify-between gap-3 bg-gradient-to-t from-[var(--oc-ink)]/90 via-[var(--oc-ink)]/55 to-transparent px-3.5 pb-3.5 pt-10 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--oc-bg)] opacity-0 transition duration-500 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 sm:flex"
            >
              <span>{openLabel}</span>
              <span aria-hidden>↗</span>
            </a>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between border-t border-white/10 bg-[var(--oc-ink)] px-3.5 py-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--oc-bg)]/85 sm:hidden"
            >
              <span>{openLabel}</span>
              <span aria-hidden>↗</span>
            </a>
          </>
        ) : null}
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
          zoom={1.18}
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
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
              className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/75 sm:text-[15px]"
            >
              {copy.lead}
            </motion.p>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-2.5"
            >
              <span className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white/90 backdrop-blur-md">
                {aboutMediaItems.length} {copy.statsAppearances}
              </span>
            </motion.div>
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
          rotate={90}
          zoom={1.05}
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
