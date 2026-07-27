'use client';

import Image from 'next/image';
import Link from 'next/link';
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
  motifPlacement = 'center'
}: {
  children: ReactNode;
  className?: string;
  motif?: boolean;
  motifSize?: 'sm' | 'md' | 'lg';
  motifPlacement?: MotifPlacement;
}) {
  return (
    <div
      className={`relative isolate overflow-hidden bg-[var(--oc-paper)] p-8 text-[var(--oc-ink)] sm:p-10 lg:p-12 ${className}`}
    >
      {motif ? <DecorationMotif size={motifSize} placement={motifPlacement} /> : null}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function HomePageContent({ featured }: { featured: ProductItem[] }) {
  const { dict } = useI18n();
  const { isAuthenticated, ready } = useAuth();

  return (
    <main>
      {/* Hero — full-bleed carpet + parallax */}
      <section className="relative min-h-[78vh] overflow-hidden sm:min-h-[85vh]">
        <ParallaxMedia intensity={130}>
          <Image
            src={stockImages.hero}
            alt="Colorful handmade Caucasian carpet detail"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </ParallaxMedia>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1a1210]/80 via-[#1a1210]/35 to-[#1a1210]/15" />
        <ParallaxContent
          intensity={48}
          className="oc-container flex min-h-[78vh] flex-col items-center justify-end pb-20 pt-32 text-center sm:min-h-[85vh] sm:pb-28"
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
          <section id="featured" className="relative oc-section overflow-hidden scroll-mt-28">
            <CarpetBackdrop
              src={stockImages.carpets.lattice}
              tone="paper"
              strength={0.28}
              rotate={90}
              zoom={1.04}
              intensity={100}
            />
            <ParallaxContent intensity={28} className="oc-container">
              <div className="mx-auto max-w-2xl text-center">
                <TextPanel className="inline-block px-8 py-5 sm:px-10 sm:py-6">
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
        <CarpetBackdrop src={stockImages.carpets.layered} tone="paper" strength={0.28} zoom={1.1} intensity={110} />
        <ParallaxContent intensity={32} className="oc-container">
          <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:max-w-2xl lg:text-left">
            <TextPanel className="inline-block px-8 py-5 sm:px-10 sm:py-6">
              <h2 className="font-display text-2xl font-normal leading-[1.3] tracking-[-0.01em] text-[var(--oc-ink)] sm:text-3xl lg:text-4xl">
                {dict.home.editorialTitle}
              </h2>
            </TextPanel>
          </div>
          <div className="mt-16 grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[4/3]">
              <ParallaxMedia intensity={70}>
                <Image
                  src={stockImages.collection}
                  alt="Handmade Caucasian and Oriental carpet collection at Origin Carpets"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </ParallaxMedia>
            </div>
            <TextPanel motif motifSize="sm" motifPlacement="bottom-right" className="max-w-xl">
              <div className="space-y-6">
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

      {/* Expertise — reading carpets (video + copy) */}
      <section id="expertise" className="relative oc-section overflow-hidden scroll-mt-28">
        <CarpetBackdrop
          src={stockImages.carpets.column}
          tone="paper"
          strength={0.28}
          rotate={90}
          zoom={1.06}
          intensity={95}
        />
        <ParallaxContent intensity={28} className="oc-container">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14 xl:gap-16">
            <div className="mx-auto w-full max-w-[280px] sm:max-w-[320px] lg:col-span-4 lg:mx-0 lg:max-w-none">
              <div className="overflow-hidden bg-[var(--oc-paper)] shadow-[var(--oc-shadow-lift)]">
                <video
                  className="aspect-[9/16] h-auto w-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                  poster={stockImages.historyVideoPoster}
                >
                  <source src={stockImages.historyVideo} type="video/mp4" />
                </video>
              </div>
            </div>
            <TextPanel motif motifSize="md" motifPlacement="bottom-right" className="lg:col-span-8">
              <p className="oc-eyebrow">{dict.home.expertiseEyebrow}</p>
              <h2 className="oc-heading-sm mt-4">{dict.home.expertiseTitle}</h2>
              <p className="oc-body mt-5 text-[var(--oc-ink)]/90 sm:text-base">{dict.home.expertiseLead}</p>
              <div className="mt-8 space-y-5">
                <p className="oc-body">{dict.home.expertiseP1}</p>
                <p className="oc-body">{dict.home.expertiseP2}</p>
                {dict.home.expertiseP3 ? <p className="oc-body">{dict.home.expertiseP3}</p> : null}
              </div>
            </TextPanel>
          </div>
        </ParallaxContent>
      </section>

      <DecorationDivider />

      {/* About */}
      <section id="about-us" className="relative oc-section overflow-hidden scroll-mt-28">
        <CarpetBackdrop src={stockImages.carpets.jewel} tone="paper" strength={0.28} zoom={1.2} intensity={105} />
        <ParallaxContent
          intensity={28}
          className="oc-container grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
        >
          <TextPanel motif motifSize="lg" motifPlacement="center" className="lg:max-w-xl">
            <p className="oc-eyebrow">{dict.home.aboutHeading}</p>
            <h2 className="oc-heading-sm mt-4">{dict.home.historyTitle}</h2>
            <div className="mt-8 space-y-5">
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
          <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden lg:max-w-none">
            <ParallaxMedia intensity={60}>
              <Image
                src={stockImages.about}
                alt="Historic carpet bazaar — the heritage behind Origin Carpets"
                fill
                className="object-cover object-center grayscale-[12%]"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </ParallaxMedia>
          </div>
        </ParallaxContent>
      </section>

      <DecorationDivider />

      {/* Carpet / Kilim */}
      <section id="carpet-origin" className="relative oc-section overflow-hidden scroll-mt-28">
        <CarpetBackdrop src={stockImages.carpets.heroCarpet} tone="paper" strength={0.28} zoom={1.1} intensity={100} />
        <ParallaxContent
          intensity={28}
          className="oc-container grid items-center gap-14 lg:grid-cols-2 lg:gap-20"
        >
          <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/10]">
            <ParallaxMedia intensity={55}>
              <Image
                src={stockImages.gallery}
                alt="Interior of Origin Carpets gallery with handmade rugs on display"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </ParallaxMedia>
          </div>
          <TextPanel motif motifSize="sm" motifPlacement="top-left">
            <div className="space-y-10">
              <div>
                <h3 className="font-display text-2xl text-[var(--oc-ink)] sm:text-3xl">
                  {dict.home.carpetTitle}
                </h3>
                <p className="oc-body mt-4">{dict.home.carpetBody}</p>
              </div>
              <div className="h-px w-16 bg-[var(--oc-line)]" />
              <div>
                <h3 className="font-display text-2xl text-[var(--oc-ink)] sm:text-3xl">
                  {dict.home.kilimTitle}
                </h3>
                <p className="oc-body mt-4">{dict.home.kilimBody}</p>
              </div>
            </div>
          </TextPanel>
        </ParallaxContent>
      </section>

      <DecorationDivider />

      <AtHomeSlider />

      <DecorationDivider />

      {/* Contact */}
      <section id="contact-us" className="relative oc-section overflow-hidden scroll-mt-28">
        <CarpetBackdrop
          src={stockImages.carpets.lions}
          tone="ink"
          strength={0.55}
          position="center 40%"
          intensity={115}
        />
        <ParallaxContent intensity={36} className="oc-container-narrow text-center text-white">
          <div className="flex justify-center [&_.font-bold]:!text-white [&_.font-light]:!text-white [&_span.flex]:!border-white/50">
            <BrandLogo size="md" />
          </div>
          <p className="mt-10 text-[11px] font-medium uppercase tracking-[0.28em] text-white/80">
            {dict.home.contactTitle}
          </p>
          <div className="mt-6 space-y-2 text-sm text-white/90">
            <p>{dict.homeExtra.phone}</p>
            <p>
              <a href="mailto:gallerycarpets19@gmail.com" className="hover:text-white">
                gallerycarpets19@gmail.com
              </a>
            </p>
            <p>{dict.homeExtra.address}</p>
          </div>
          <div
            id="guides-policies"
            className="mt-14 flex flex-wrap justify-center gap-x-8 gap-y-3 text-[11px] uppercase tracking-[0.18em] text-white/75"
          >
            <Link href="/#about-us" className="hover:text-white">
              {dict.nav.about}
            </Link>
            <Link href="/products" className="hover:text-white">
              {dict.nav.shop}
            </Link>
            <Link href="/policies/return-refund" className="hover:text-white">
              {dict.home.policyReturn}
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
