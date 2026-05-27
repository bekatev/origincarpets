'use client';

import Link from 'next/link';
import { useI18n } from '@/components/providers/i18n-provider';

export default function HomePage() {
  const { dict } = useI18n();

  return (
    <main>
      <section id="about-us" className="oc-section border-b border-[var(--oc-line)]">
        <div className="oc-container grid gap-10 lg:grid-cols-[1.25fr_1fr]">
          <div className="space-y-6">
            <p className="oc-subtitle">{dict.home.heroSubtitle}</p>
            <h1 className="font-display text-4xl uppercase leading-tight tracking-[0.1em] sm:text-5xl">
              {dict.home.heroTitle1}
              <br />
              {dict.home.heroTitle2}
            </h1>
            <p className="max-w-xl text-[15px] leading-7 text-[var(--oc-muted)]">{dict.home.heroBody}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/products" className="oc-btn-primary">
                {dict.home.featuredPieces}
              </Link>
              <Link href="/login" className="oc-btn-secondary">
                {dict.home.memberLogin}
              </Link>
            </div>
          </div>
          <div className="oc-surface p-6 sm:p-8">
            <p className="oc-kicker">{dict.home.curatorSelection}</p>
            <ul className="mt-4 space-y-3 text-sm text-[var(--oc-muted)]">
              <li>Karabakh kilim with Roses — $800</li>
              <li>Caucasian and oriental hand-woven carpets</li>
              <li>Satisfied customers from over the world</li>
              <li>Professional stories and tips around carpets</li>
              <li>30+ years of experience</li>
            </ul>
            <Link href="/register" className="mt-6 inline-flex text-sm font-semibold uppercase tracking-[0.12em] hover:text-[var(--oc-brand-soft)]">
              {dict.home.createAccount}
            </Link>
          </div>
        </div>
      </section>

      <section id="carpet-origin" className="oc-section border-b border-[var(--oc-line)]">
        <div className="oc-container grid gap-8 lg:grid-cols-2">
          <article className="oc-surface p-6 sm:p-8">
            <p className="oc-subtitle">{dict.home.historyTitle}</p>
            <p className="mt-4 text-sm leading-7 text-[var(--oc-muted)]">{dict.home.historyP1}</p>
            <p className="mt-4 text-sm leading-7 text-[var(--oc-muted)]">{dict.home.historyP2}</p>
            <p className="mt-4 text-sm leading-7 text-[var(--oc-muted)]">{dict.home.historyP3}</p>
          </article>

          <article className="oc-surface p-6 sm:p-8">
            <p className="oc-subtitle">{dict.home.categoriesTitle}</p>
            <div className="mt-4 space-y-6">
              <div>
                <h2 className="font-display text-2xl uppercase tracking-[0.08em]">{dict.home.carpetTitle}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--oc-muted)]">{dict.home.carpetBody}</p>
              </div>
              <div>
                <h2 className="font-display text-2xl uppercase tracking-[0.08em]">{dict.home.kilimTitle}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--oc-muted)]">{dict.home.kilimBody}</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section id="contact-us" className="oc-section">
        <div className="oc-container">
          <div className="oc-surface p-6 sm:p-8">
            <p className="oc-subtitle">{dict.home.contactTitle}</p>
            <div className="mt-4 grid gap-3 text-sm text-[var(--oc-muted)] md:grid-cols-2">
              <p>T. 995 577 405 311</p>
              <p>E. info@origincarpets.com</p>
              <p className="md:col-span-2">A. 8/10 Erekle II street, Tbilisi, Georgia</p>
            </div>
            <div id="guides-policies" className="mt-6 flex flex-wrap gap-4 text-xs uppercase tracking-[0.14em] text-[var(--oc-brand-soft)]">
              <span>About Us</span>
              <span>Carpets</span>
              <span>Carpet Origin</span>
              <span>Guides &amp; Policies</span>
              <span>{dict.home.policyReturn}</span>
              <span>{dict.home.policyPrivacy}</span>
              <span id="virtual-appointment">Book virtual appointment</span>
              <span id="social-media">{dict.home.socialMedia}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
