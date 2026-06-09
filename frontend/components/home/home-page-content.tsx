'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BrandLogo } from '@/components/brand/brand-logo';
import { FeaturedProductCard } from '@/components/home/featured-product-card';
import { useI18n } from '@/components/providers/i18n-provider';
import type { ProductItem } from '@/lib/products';
import { stockImages } from '@/lib/stock-images';

export function HomePageContent({ featured }: { featured: ProductItem[] }) {
  const { dict } = useI18n();

  return (
    <main>
      <section className="relative">
        <div className="relative aspect-[16/10] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
          <Image
            src={stockImages.hero}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="oc-container-narrow py-14 text-center sm:py-20">
          <p className="oc-eyebrow">{dict.home.heroSubtitle}</p>
          <h1 className="oc-heading mt-5">{dict.home.siteTitle}</h1>
          <p className="oc-lead mx-auto mt-6 max-w-xl">{dict.home.heroBody}</p>
          <Link href="/products" className="oc-btn-primary mt-10 inline-flex">
            {dict.home.exploreCollection}
          </Link>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="oc-section-tight border-t border-[var(--oc-line)]">
          <div className="oc-container">
            <h2 className="oc-heading-sm text-center">{dict.home.featuredCollection}</h2>
            <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {featured.map((product, index) => (
                <FeaturedProductCard key={product.id} product={product} priority={index < 4} />
              ))}
            </div>
            <div className="mt-14 text-center">
              <Link href="/products" className="oc-link oc-link-arrow">
                {dict.home.featuredPieces}
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="oc-section border-t border-[var(--oc-line)]">
        <div className="oc-container">
          <div className="oc-container-narrow text-center">
            <h2 className="font-display text-2xl font-normal leading-[1.35] tracking-[-0.01em] text-[var(--oc-ink)] sm:text-3xl lg:text-4xl">
              {dict.home.editorialTitle}
            </h2>
          </div>
          <div className="mt-14 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="relative aspect-[4/3] overflow-hidden bg-[var(--oc-bg-secondary)]">
              <Image
                src={stockImages.collection}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="space-y-6 lg:pr-8">
              <p className="oc-body">{dict.home.editorialBody}</p>
              <p className="oc-body">{dict.homeExtra.curator2}</p>
              <Link href="/#about-us" className="oc-link oc-link-arrow inline-flex">
                {dict.home.readStory}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="about-us" className="oc-section border-t border-[var(--oc-line)] bg-[var(--oc-bg-secondary)]">
        <div className="oc-container grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div>
            <p className="oc-eyebrow">{dict.home.aboutHeading}</p>
            <h2 className="oc-heading-sm mt-4">{dict.home.historyTitle}</h2>
            <div className="mt-8 space-y-5">
              <p className="oc-body">{dict.home.historyP1}</p>
              <p className="oc-body">{dict.home.historyP2}</p>
              <p className="oc-body">{dict.home.historyP3}</p>
            </div>
            <Link href="/register" className="oc-link oc-link-arrow mt-8 inline-flex">
              {dict.home.createAccount}
            </Link>
          </div>
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image
              src={stockImages.about}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section id="carpet-origin" className="oc-section border-t border-[var(--oc-line)]">
        <div className="oc-container grid gap-12 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={stockImages.gallery}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center space-y-8">
            <div>
              <h3 className="font-display text-xl text-[var(--oc-ink)]">{dict.home.carpetTitle}</h3>
              <p className="oc-body mt-3">{dict.home.carpetBody}</p>
            </div>
            <div className="oc-divider" />
            <div>
              <h3 className="font-display text-xl text-[var(--oc-ink)]">{dict.home.kilimTitle}</h3>
              <p className="oc-body mt-3">{dict.home.kilimBody}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact-us" className="oc-section border-t border-[var(--oc-line)]">
        <div className="oc-container-narrow text-center">
          <div className="flex justify-center">
            <BrandLogo size="md" />
          </div>
          <p className="oc-eyebrow mt-10">{dict.home.contactTitle}</p>
          <div className="mt-6 space-y-2 text-sm text-[var(--oc-muted)]">
            <p>{dict.homeExtra.phone}</p>
            <p>
              <a href="mailto:info@origincarpets.com" className="hover:text-[var(--oc-ink)]">
                info@origincarpets.com
              </a>
            </p>
            <p>{dict.homeExtra.address}</p>
          </div>
          <div
            id="guides-policies"
            className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-[var(--oc-muted)]"
          >
            <Link href="/#about-us" className="hover:text-[var(--oc-ink)]">
              {dict.nav.about}
            </Link>
            <Link href="/products" className="hover:text-[var(--oc-ink)]">
              {dict.nav.shop}
            </Link>
            <Link href="/policies/return-refund" className="hover:text-[var(--oc-ink)]">
              {dict.home.policyReturn}
            </Link>
            <Link href="/policies/privacy" className="hover:text-[var(--oc-ink)]">
              {dict.home.policyPrivacy}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
