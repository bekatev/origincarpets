'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import type { ReactNode } from 'react';
import { BrandLogo } from '@/components/brand/brand-logo';
import { CarpetBackdrop } from '@/components/home/carpet-backdrop';
import { DecorationDivider } from '@/components/home/decoration-divider';
import { DecorationMotif, type MotifPlacement } from '@/components/home/decoration-motif';
import { FeaturedProductCard } from '@/components/home/featured-product-card';
import { AtHomeSlider } from '@/components/home/at-home-slider';
import { ParallaxContent, ParallaxMedia } from '@/components/motion/parallax-media';
import { useAuth } from '@/components/providers/auth-provider';
import { useI18n } from '@/components/providers/i18n-provider';
import type { ProductItem } from '@/lib/products';
import { stockImages } from '@/lib/stock-images';

/** Solid paper panel so copy stays readable over vivid carpet backdrops. */
function TextPanel({
  children,
  className = '',
  motif = false,
  motifSize = 'md',
  motifPlacement = 'center',
  motifVariant = 'lace'
}: {
  children: ReactNode;
  className?: string;
  motif?: boolean;
  motifSize?: 'sm' | 'md' | 'lg' | 'xl';
  motifPlacement?: MotifPlacement;
  /** Prefer lace; use medallion sparingly (~30% of motifs site-wide). */
  motifVariant?: 'lace' | 'medallion';
}) {
  return (
    <div
      className={`relative isolate overflow-hidden bg-[var(--oc-paper)] p-8 text-[var(--oc-ink)] sm:p-10 lg:p-12 ${className}`}
    >
      {motif ? (
        <DecorationMotif size={motifSize} placement={motifPlacement} variant={motifVariant} />
      ) : null}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function HomePageContent({ featured }: { featured: ProductItem[] }) {
  const { dict } = useI18n();
  const { isAuthenticated, ready } = useAuth();

  return (
    <main>
      {/* Hero — full-bleed carpet (compact so copy isn’t lost in empty height) */}
      <section className="relative min-h-[52vh] overflow-hidden sm:min-h-[56vh] lg:min-h-[58vh]">
        <ParallaxMedia>
          <Image
            src={stockImages.hero}
            alt="Stacks of handmade Caucasian and Oriental carpets in the Origin Carpets gallery"
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1920px) 100vw, 1920px"
            quality={75}
          />
        </ParallaxMedia>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1a1210]/55 via-[#1a1210]/28 to-[#1a1210]/12" />
        <ParallaxContent
          intensity={48}
          className="oc-container relative z-10 flex min-h-[52vh] flex-col items-center justify-end pb-12 pt-24 text-center sm:min-h-[56vh] sm:pb-16 lg:min-h-[58vh]"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-white/70">
            {dict.home.heroSubtitle}
          </p>
          <h1 className="mt-6 max-w-4xl font-display text-4xl font-normal leading-[1.1] tracking-[-0.02em] text-white sm:text-5xl lg:text-7xl">
            {dict.home.siteTitle}
          </h1>
          <p className="mx-auto mt-7 max-w-lg text-base leading-[1.8] text-white/80 sm:text-lg">
            {dict.home.heroBody}
          </p>
          <Link
            href="/products"
            className="mt-12 inline-flex items-center justify-center border border-white/90 bg-white/10 px-10 py-4 text-[11px] font-medium uppercase tracking-[0.24em] text-white backdrop-blur-[2px] transition duration-300 hover:bg-white hover:text-[#1a1210]"
          >
            {dict.home.exploreCollection}
          </Link>
        </ParallaxContent>
      </section>

      <DecorationDivider />

      {/* Featured */}
      {featured.length > 0 && (
        <>
          <section
            id="featured"
            className="relative oc-section overflow-hidden scroll-mt-28 bg-[var(--oc-bg)]"
          >
            <DecorationMotif size="hero" placement="top-left" opacity={0.18} />
            <DecorationMotif size="xl" placement="bottom-right" opacity={0.22} />
            <ParallaxContent intensity={28} className="oc-container relative z-10">
              <div className="mx-auto max-w-2xl text-center">
                <TextPanel
                  motif
                  motifSize="md"
                  motifPlacement="top-right"
                  className="inline-block px-8 py-5 sm:px-10 sm:py-6"
                >
                  <h2 className="oc-heading-sm">{dict.home.featuredCollection}</h2>
                </TextPanel>
              </div>
              <div className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                {featured.map((product, index) => (
                  <FeaturedProductCard key={product.id} product={product} priority={index < 4} />
                ))}
              </div>
              <div className="mt-16 text-center">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-[var(--oc-paper)] px-6 py-3 text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--oc-ink)] transition hover:opacity-80"
                >
                  {dict.home.featuredPieces}
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </ParallaxContent>
          </section>
          <DecorationDivider />
        </>
      )}

      {/* Editorial */}
      <section id="collection" className="relative oc-section overflow-hidden scroll-mt-28">
        <CarpetBackdrop
          src={stockImages.carpets.editorial}
          tone="paper"
          strength={0}
          rotate={90}
          zoom={1.2}
        />
        <ParallaxContent intensity={32} className="oc-container">
          <div className="mx-auto max-w-3xl text-center">
            <TextPanel
              motif
              motifSize="md"
              motifPlacement="bottom-left"
              className="inline-block px-8 py-5 sm:px-10 sm:py-6"
            >
              <h2 className="font-display text-2xl font-normal leading-[1.3] tracking-[-0.01em] text-[var(--oc-ink)] sm:text-3xl lg:text-4xl">
                {dict.home.editorialTitle}
              </h2>
            </TextPanel>
          </div>
          <div className="mx-auto mt-12 max-w-xl text-center sm:mt-14">
            <TextPanel motif motifSize="lg" motifPlacement="top-left" className="inline-block">
              <div className="space-y-6 text-center">
                <p className="oc-body">{dict.home.editorialBody}</p>
                <p className="oc-body">{dict.homeExtra.curator2}</p>
                <Link href="/#about-us" className="oc-link oc-link-arrow inline-flex">
                  {dict.home.readStory}
                </Link>
              </div>
            </TextPanel>
          </div>
        </ParallaxContent>
      </section>

      <DecorationDivider />

      {/* Expertise section hidden — content moved toward About Us page */}

      {/* About */}
      <section id="about-us" className="relative oc-section overflow-hidden scroll-mt-28">
        <CarpetBackdrop
          src={stockImages.carpets.history}
          tone="paper"
          strength={0}
          rotate={90}
          zoom={1.2}
        />
        <ParallaxContent intensity={28} className="oc-container">
          <div className="mx-auto max-w-xl text-center">
            <TextPanel motif motifSize="xl" motifPlacement="bottom-left" className="inline-block">
              <p className="oc-eyebrow">{dict.home.aboutHeading}</p>
              <h2 className="oc-heading-sm mt-4">{dict.home.historyTitle}</h2>
              <div className="mt-8 space-y-5 text-center">
                <p className="oc-body">{dict.home.historyP1}</p>
                <p className="oc-body">{dict.home.historyP2}</p>
                <p className="oc-body">{dict.home.historyP3}</p>
              </div>
              <Link
                href={ready && isAuthenticated ? '/orders' : '/register'}
                className="oc-link oc-link-arrow mt-10 inline-flex"
              >
                {ready && isAuthenticated ? dict.home.goToProfile : dict.home.createAccount}
              </Link>
            </TextPanel>
          </div>
        </ParallaxContent>
      </section>

      <DecorationDivider />

      {/* Carpet / Kilim */}
      <section
        id="carpet-origin"
        className="relative oc-section overflow-hidden scroll-mt-28 bg-[var(--oc-bg)]"
      >
        <DecorationMotif size="hero" placement="right" opacity={0.18} variant="medallion" />
        <DecorationMotif size="xl" placement="bottom-left" opacity={0.2} variant="medallion" />
        <ParallaxContent intensity={28} className="oc-container relative z-10">
          <div className="mx-auto max-w-2xl text-center">
            <TextPanel
              motif
              motifSize="md"
              motifPlacement="top-right"
              motifVariant="medallion"
              className="inline-block px-8 py-5 sm:px-10 sm:py-6"
            >
              <h2 className="oc-heading-sm">{dict.home.categoriesTitle}</h2>
            </TextPanel>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-8 sm:mt-14 sm:grid-cols-3 sm:gap-x-10 sm:gap-y-10">
            {(
              [
                ['carpetTitle', 'carpetBody'],
                ['kilimTitle', 'kilimBody'],
                ['soumakTitle', 'soumakBody'],
                ['ziliTitle', 'ziliBody'],
                ['djidjimTitle', 'djidjimBody'],
                ['decorationTitle', 'decorationBody']
              ] as const
            ).map(([titleKey, bodyKey]) => (
              <TextPanel
                key={titleKey}
                motif
                motifSize="sm"
                motifPlacement="bottom-right"
                motifVariant="medallion"
                className="h-full"
              >
                <h3 className="font-display text-2xl text-[var(--oc-ink)] sm:text-3xl">
                  {dict.home[titleKey]}
                </h3>
                <p className="oc-body mt-4">{dict.home[bodyKey]}</p>
              </TextPanel>
            ))}
          </div>

          <div className="relative mx-auto mt-12 aspect-[16/10] w-full max-w-5xl overflow-hidden sm:mt-16 sm:aspect-[21/9]">
            <ParallaxMedia intensity={55}>
              <Image
                src={stockImages.gallery}
                alt="Interior of Origin Carpets gallery with handmade rugs on display"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </ParallaxMedia>
          </div>
        </ParallaxContent>
      </section>

      <DecorationDivider />

      <AtHomeSlider />

      <DecorationDivider />

      {/* Contact */}
      <section id="contact-us" className="relative oc-section overflow-hidden scroll-mt-28">
        <CarpetBackdrop
          src={stockImages.carpets.contact}
          tone="ink"
          strength={0.45}
          position="center"
        />
        <ParallaxContent
          intensity={36}
          className="oc-container-narrow relative z-10 text-center text-white"
        >
          <div className="flex justify-center [&_.font-bold]:!text-white [&_.font-light]:!text-white [&_span.flex]:!border-white/50">
            <BrandLogo size="md" />
          </div>
          <p className="mt-10 text-[11px] font-medium uppercase tracking-[0.28em] text-white/80">
            {dict.home.contactTitle}
          </p>
          <div className="mt-6 space-y-2 text-sm text-white/90">
            <p>{dict.homeExtra.phone}</p>
            <p>
              <a href="mailto:info@origincarpets.com" className="hover:text-white">
                info@origincarpets.com
              </a>
            </p>
            <p>{dict.homeExtra.address}</p>
          </div>
          <div
            id="guides-policies"
            className="mt-14 flex flex-wrap justify-center gap-x-8 gap-y-3 text-[11px] uppercase tracking-[0.18em] text-white/75"
          >
            <Link href={'/about' as Route} className="hover:text-white">
              {dict.nav.about}
            </Link>
            <Link href="/products" className="hover:text-white">
              {dict.nav.shop}
            </Link>
            <Link href="/policies/return-refund" className="hover:text-white">
              {dict.home.policyReturn}
            </Link>
            <Link href={'/policies/shipping' as Route} className="hover:text-white">
              {dict.home.policyShipping}
            </Link>
            <Link href="/policies/privacy" className="hover:text-white">
              {dict.home.policyPrivacy}
            </Link>
          </div>
        </ParallaxContent>
      </section>
    </main>
  );
}
