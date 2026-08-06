'use client';

import Image from 'next/image';
import { type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CarpetBackdrop } from '@/components/home/carpet-backdrop';
import { DecorationDivider } from '@/components/home/decoration-divider';
import { DecorationMotif, type MotifPlacement } from '@/components/home/decoration-motif';
import { useI18n } from '@/components/providers/i18n-provider';
import {
  featuredGuests,
  guestGallery,
  staffPhotos,
  type FeaturedGuest,
  type GalleryPhoto
} from '@/lib/about-gallery';
import {
  aboutMediaItems,
  facebookEmbedSrc,
  type AboutMediaItem,
  type MediaOrientation
} from '@/lib/about-media';
import { cn } from '@/lib/cn';
import { stockImages } from '@/lib/stock-images';

function chunkItems<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

const PORTRAIT = { width: 320, height: 568 };
const LANDSCAPE = { width: 720, height: 405 };
/** Soft frame behind contained photos — matches product gallery beige. */
const PHOTO_FRAME = '#f4ebe0';

/**
 * Facebook’s plugin often paints unused light chrome under the video.
 * We size the iframe taller than the crop box and clip the bottom —
 * no CSS transform (transforms break seek-bar hit-testing).
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
  /** Extra height so FB’s bottom chrome falls outside the visible crop. */
  const iframeHeightPct = isLandscape ? '124%' : '114%';
  const embedSize = {
    width: size.width,
    height: Math.round(size.height * (isLandscape ? 1.24 : 1.14))
  };

  return (
    <div
      className="relative w-full overflow-hidden bg-black"
      style={
        isLandscape
          ? { aspectRatio: '16 / 9' }
          : { maxWidth: size.width, aspectRatio: `${size.width} / ${size.height}`, marginInline: 'auto' }
      }
    >
      <iframe
        title={title}
        src={facebookEmbedSrc(href, embedSize)}
        className="absolute left-0 top-0 w-full border-0"
        style={{ height: iframeHeightPct }}
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}

function mediaKindLabel(
  item: AboutMediaItem,
  labels: { video: string; tv: string; local: string }
): string {
  if (item.kind === 'ajaratv') return labels.tv;
  if (item.kind === 'local') return labels.local;
  return labels.video;
}

/** Solid cream panel + near-black type in light mode (readable on carpet). */
function SectionIntro({
  eyebrow,
  title,
  lead,
  className,
  motifPlacement = 'top-right',
  motifSize = 'md'
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  className?: string;
  motifPlacement?: MotifPlacement;
  motifSize?: 'sm' | 'md' | 'lg';
}) {
  return (
    <div
      className={cn(
        'relative isolate mx-auto mb-10 max-w-2xl overflow-hidden px-5 py-6 text-center sm:mb-12 sm:px-8 sm:py-7',
        'bg-[#f7f0e6] shadow-[var(--oc-shadow-lift)] ring-1 ring-[#2a1c18]/12',
        'dark:bg-[var(--oc-paper)] dark:ring-[var(--oc-ink)]/10',
        className
      )}
    >
      <DecorationMotif size={motifSize} placement={motifPlacement} />
      <div className="relative z-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#6b4f42] dark:text-[var(--oc-muted)]">
          {eyebrow}
        </p>
        <h2 className="mt-2 font-display text-2xl text-[#1c1210] sm:text-3xl lg:text-[2.15rem] dark:text-[var(--oc-ink)]">
          {title}
        </h2>
        {lead ? (
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#3d2a22] sm:text-[15px] dark:text-[var(--oc-muted)]">
            {lead}
          </p>
        ) : null}
      </div>
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
  localLabel,
  locale
}: {
  item: AboutMediaItem;
  index: number;
  label: string;
  openLabel: string;
  tvEyebrow: string;
  tvBody: string;
  watchLabel: string;
  localLabel: string;
  locale: string;
}) {
  const reduceMotion = useReducedMotion();
  const n = String(index + 1).padStart(2, '0');
  const isLandscape = item.orientation === 'landscape';
  const kindLabel = mediaKindLabel(item, {
    video: label,
    tv: tvEyebrow,
    local: localLabel
  });

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
          'relative overflow-hidden bg-black shadow-[var(--oc-shadow-lift)] ring-1 ring-[var(--oc-ink)]/15',
          isLandscape ? 'mx-auto w-full max-w-[720px]' : 'mx-auto w-full max-w-[320px]'
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-3">
          <span className="rounded-sm bg-[#f7f0e6]/95 px-2 py-1 font-display text-[11px] tracking-[0.14em] text-[#1c1210] backdrop-blur-sm">
            {n}
          </span>
          <span className="rounded-sm bg-black/65 px-2 py-1 text-[9px] font-medium uppercase tracking-[0.2em] text-white backdrop-blur-sm">
            {kindLabel}
          </span>
        </div>

        {item.kind === 'facebook' ? (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="sr-only"
          >
            {openLabel}
          </a>
        ) : null}

        {item.kind === 'facebook' ? (
          <FacebookEmbed href={item.href} orientation={item.orientation} title={`${label} ${n}`} />
        ) : item.kind === 'local' ? (
          <div className="relative aspect-video w-full overflow-hidden bg-black">
            <video
              controls
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover"
              aria-label={locale === 'ka' ? item.titleKa : item.titleEn}
            >
              <source src={item.src} type="video/mp4" />
            </video>
          </div>
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

function FeaturedGuestBlock({
  guest,
  index,
  locale
}: {
  guest: FeaturedGuest;
  index: number;
  locale: string;
}) {
  const reduceMotion = useReducedMotion();
  const photos =
    guest.images && guest.images.length > 0
      ? guest.images
      : [{ src: guest.src, width: guest.width, height: guest.height }];
  const name = locale === 'ka' ? guest.nameKa : guest.nameEn;
  const role = locale === 'ka' ? guest.roleKa : guest.roleEn;
  const caption = locale === 'ka' ? guest.captionKa : guest.captionEn;
  const motifPlacement = index % 2 === 0 ? 'bottom-right' : 'bottom-left';
  /** Prefer a landscape frame when both shots are wide; otherwise a shared portrait frame. */
  const allLandscape = photos.every((photo) => photo.width >= photo.height);
  const frameAspect = allLandscape ? 'aspect-[3/2]' : 'aspect-[3/4]';

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 36 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-4xl"
    >
      <div
        className={cn(
          'relative isolate mx-auto max-w-2xl overflow-hidden bg-[#f7f0e6] px-6 py-8 text-center shadow-[var(--oc-shadow-lift)] ring-1 ring-[#2a1c18]/12 sm:px-10 sm:py-9',
          'dark:bg-[var(--oc-paper)] dark:ring-[var(--oc-ink)]/10'
        )}
      >
        <DecorationMotif size="md" placement={motifPlacement} />
        <div className="relative z-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#6b4f42] dark:text-[var(--oc-muted)]">
            {role}
          </p>
          <h3 className="mt-3 font-display text-3xl tracking-[-0.02em] text-[#1c1210] sm:text-4xl dark:text-[var(--oc-ink)]">
            {name}
          </h3>
          <div className="mx-auto mt-5 h-px w-16 bg-[#1c1210]/25 dark:bg-[var(--oc-ink)]/25" />
          <p className="mx-auto mt-5 max-w-xl font-display text-xl leading-relaxed text-[#2a1c18] sm:text-2xl dark:text-[var(--oc-ink)]">
            {caption}
          </p>
        </div>
      </div>

      <div
        className={cn(
          'mt-6 grid gap-3 sm:mt-8 sm:gap-4',
          photos.length > 1 ? 'grid-cols-2' : 'mx-auto max-w-xl grid-cols-1'
        )}
      >
        {photos.map((photo, photoIndex) => (
          <div
            key={photo.src}
            className={cn(
              'relative overflow-hidden shadow-[var(--oc-shadow-lift)] ring-1 ring-[#2a1c18]/12 dark:ring-[var(--oc-ink)]/10',
              frameAspect
            )}
            style={{ backgroundColor: PHOTO_FRAME }}
          >
            <Image
              src={photo.src}
              alt={name}
              fill
              className="object-cover object-center"
              sizes={
                photos.length > 1
                  ? '(max-width: 1024px) 50vw, 420px'
                  : '(max-width: 1024px) 100vw, 560px'
              }
              priority={index === 0 && photoIndex === 0}
            />
          </div>
        ))}
      </div>
    </motion.article>
  );
}

/** Full image, no crop — frame hugs the photo (never stretches empty). */
function ContainedPhoto({
  photo,
  locale,
  className,
  priority,
  sizes = '(max-width: 768px) 50vw, 33vw'
}: {
  photo: GalleryPhoto;
  locale: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const reduceMotion = useReducedMotion();
  const alt = locale === 'ka' ? photo.altKa : photo.altEn;

  return (
    <motion.figure
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'overflow-hidden bg-[#f4ebe0] shadow-[var(--oc-shadow-lift)] ring-1 ring-[#2a1c18]/10 dark:ring-[var(--oc-ink)]/10',
        /* critical: do not stretch in CSS grid rows */
        'h-fit self-start',
        className
      )}
    >
      <Image
        src={photo.src}
        alt={alt}
        width={photo.width}
        height={photo.height}
        className="h-auto w-full"
        sizes={sizes}
        quality={85}
        priority={priority}
      />
    </motion.figure>
  );
}

function AboutSection({ children }: { children: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-[var(--oc-bg)] py-12 sm:py-14 lg:py-16">
      <div className="oc-container relative">{children}</div>
    </section>
  );
}

export function AboutPageContent() {
  const { dict, locale } = useI18n();
  const copy = dict.aboutPage;
  const reduceMotion = useReducedMotion();
  const [teamLead, ...teamRest] = staffPhotos;
  const videoChunks = chunkItems(aboutMediaItems, 3);

  return (
    <main>
      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
        <CarpetBackdrop src={stockImages.carpets.jewel} tone="paper" strength={0} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1a1210]/55 via-[#1a1210]/28 to-[#1a1210]/12" />
        <div className="oc-container relative z-10">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
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
        </div>
      </section>

      <DecorationDivider />

      {/* 1. Videos */}
      {videoChunks.map((group, groupIndex) => {
        const startIndex = groupIndex * 3;
        return (
          <div key={`video-group-${groupIndex}`}>
            {groupIndex > 0 ? <DecorationDivider /> : null}
            <AboutSection>
              {groupIndex === 0 ? (
                <SectionIntro
                  eyebrow={copy.galleryEyebrow}
                  title={copy.galleryTitle}
                  motifPlacement="top-right"
                  motifSize="md"
                />
              ) : null}

              <div className="mx-auto flex max-w-3xl flex-col items-center gap-10 sm:gap-12">
                {group.map((item, index) => (
                  <MediaFrame
                    key={item.id}
                    item={item}
                    index={startIndex + index}
                    label={copy.facebookEmbedLabel}
                    openLabel={copy.openOnFacebook}
                    tvEyebrow={copy.tvEyebrow}
                    tvBody={copy.tvBody}
                    watchLabel={copy.watchOnAdjara}
                    localLabel={copy.localVideoLabel}
                    locale={locale}
                  />
                ))}
              </div>
            </AboutSection>
          </div>
        );
      })}

      <DecorationDivider />

      {/* 2. Distinguished guests */}
      <AboutSection>
        <SectionIntro
          eyebrow={copy.guestsEyebrow}
          title={copy.guestsTitle}
          lead={copy.guestsLead}
          motifPlacement="bottom-left"
          motifSize="lg"
        />

        <div className="mx-auto flex max-w-5xl flex-col gap-12 lg:gap-16">
          {featuredGuests.map((guest, index) => (
            <FeaturedGuestBlock key={guest.id} guest={guest} index={index} locale={locale} />
          ))}
        </div>
      </AboutSection>

      <DecorationDivider />

      {/* 3. Guest archive — clean aspect-aware grid */}
      <AboutSection>
        <SectionIntro
          eyebrow={copy.guestGalleryEyebrow}
          title={copy.guestGalleryTitle}
          motifPlacement="right"
          motifSize="lg"
        />

        <div className="mx-auto grid max-w-5xl grid-cols-2 items-start gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5">
          {guestGallery.map((photo, i) => {
            const isLandscape = photo.width >= photo.height;
            return (
              <ContainedPhoto
                key={photo.id}
                photo={photo}
                locale={locale}
                className={cn(isLandscape && 'col-span-2 lg:col-span-2')}
                sizes={
                  isLandscape
                    ? '(max-width: 1024px) 100vw, 66vw'
                    : '(max-width: 1024px) 50vw, 33vw'
                }
                priority={i < 3}
              />
            );
          })}
        </div>
      </AboutSection>

      <DecorationDivider />

      {/* 4. Staff */}
      <AboutSection>
        <SectionIntro
          eyebrow={copy.staffEyebrow}
          title={copy.staffTitle}
          lead={copy.staffLead}
          motifPlacement="top-left"
          motifSize="md"
        />

        {teamLead ? (
          <ContainedPhoto
            photo={teamLead}
            locale={locale}
            className="mx-auto mb-4 w-full max-w-5xl sm:mb-5"
            sizes="(max-width: 1024px) 100vw, 1024px"
            priority
          />
        ) : null}

        <div className="mx-auto grid max-w-5xl grid-cols-1 items-start gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {teamRest.map((photo, i) => (
            <ContainedPhoto
              key={photo.id}
              photo={photo}
              locale={locale}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={i < 2}
            />
          ))}
        </div>
      </AboutSection>
    </main>
  );
}
