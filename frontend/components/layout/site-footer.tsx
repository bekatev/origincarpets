'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { DecorationDivider } from '@/components/home/decoration-divider';
import { FacebookIcon, InstagramIcon } from '@/components/icons/social-icons';
import { MastercardIcon, VisaIcon } from '@/components/icons/payment-icons';
import { useI18n } from '@/components/providers/i18n-provider';
import {
  FOOTER_CARPET_SLUGS,
  FOOTER_ORIGIN_FILTERS,
  FOOTER_SOCIAL
} from '@/lib/i18n-footer';

function productsHref(params: Record<string, string>): Route {
  const search = new URLSearchParams(params);
  return `/products?${search.toString()}` as Route;
}

export function SiteFooter() {
  const { dict } = useI18n();
  const f = dict.footerLinks;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--oc-bg)]">
      <DecorationDivider />
      <div className="oc-container py-16 sm:py-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          <div>
            <p className="oc-eyebrow mb-5">{f.aboutUs}</p>
            <ul className="space-y-3 text-sm text-[var(--oc-ink)]">
              <li>
                <Link href="/#about-us" className="hover:opacity-50">
                  {f.aboutLinks.company}
                </Link>
              </li>
              <li>
                <Link href="/#contact-us" className="hover:opacity-50">
                  {f.aboutLinks.contacts}
                </Link>
              </li>
              <li>
                <Link href="/#about-us" className="hover:opacity-50">
                  {f.aboutLinks.blog}
                </Link>
              </li>
              <li>
                <Link href="/#about-us" className="hover:opacity-50">
                  {f.aboutLinks.projects}
                </Link>
              </li>
              <li>
                <Link href="/#about-us" className="hover:opacity-50">
                  {f.aboutLinks.stories}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="oc-eyebrow mb-5">{f.carpets}</p>
            <ul className="space-y-3 text-sm uppercase tracking-[0.08em] text-[var(--oc-ink)]">
              {(Object.keys(FOOTER_CARPET_SLUGS) as Array<keyof typeof FOOTER_CARPET_SLUGS>).map((key) => (
                <li key={key}>
                  <Link
                    href={productsHref({ category: FOOTER_CARPET_SLUGS[key] })}
                    className="hover:opacity-50"
                  >
                    {f.carpetTypes[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="oc-eyebrow mb-5">{f.carpetOrigin}</p>
            <ul className="space-y-3 text-sm text-[var(--oc-ink)]">
              {(Object.keys(FOOTER_ORIGIN_FILTERS) as Array<keyof typeof FOOTER_ORIGIN_FILTERS>).map((key) => (
                <li key={key}>
                  <Link
                    href={productsHref({ origin: FOOTER_ORIGIN_FILTERS[key] })}
                    className="hover:opacity-50"
                  >
                    {f.origins[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="oc-eyebrow mb-5">{f.guidesPolicies}</p>
            <ul className="space-y-3 text-sm text-[var(--oc-ink)]">
              <li>
                <Link href="/policies/return-refund" className="hover:opacity-50">
                  {dict.home.policyReturn}
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy" className="hover:opacity-50">
                  {dict.home.policyPrivacy}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-8">
            <div>
              <p className="oc-eyebrow mb-5">{f.contactUs}</p>
              <ul className="space-y-3 text-sm text-[var(--oc-muted)]">
                <li>
                  <a href="tel:+995577405311" className="hover:text-[var(--oc-ink)]">
                    {dict.homeExtra.phone}
                  </a>
                </li>
                <li>
                  <a href="mailto:info@origincarpets.com" className="hover:text-[var(--oc-ink)]">
                    {dict.homeExtra.email}
                  </a>
                </li>
                <li>{dict.homeExtra.address}</li>
              </ul>
            </div>

            <div>
              <p className="oc-eyebrow mb-4">{f.socialMedia}</p>
              <div className="flex items-center gap-3">
                <a
                  href={FOOTER_SOCIAL.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--oc-line)] text-[var(--oc-ink)] transition hover:border-[var(--oc-ink)] hover:opacity-80"
                >
                  <FacebookIcon />
                </a>
                <a
                  href={FOOTER_SOCIAL.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--oc-line)] text-[var(--oc-ink)] transition hover:border-[var(--oc-ink)] hover:opacity-80"
                >
                  <InstagramIcon />
                </a>
              </div>
              <a
                href="mailto:gallerycarpets19@gmail.com?subject=Virtual%20Appointment%20Request"
                className="oc-link mt-6 inline-flex text-[10px] font-medium uppercase tracking-[0.22em]"
              >
                {f.bookAppointment}
              </a>
            </div>
          </div>
        </div>

        <div className="oc-divider mt-14 flex flex-col items-center justify-between gap-6 pt-8 sm:flex-row">
          <p className="text-center text-[10px] uppercase tracking-[0.16em] text-[var(--oc-muted)] sm:text-left sm:text-[11px] sm:tracking-[0.2em]">
            {f.copyright.replace('{year}', String(year))}
          </p>
          <div className="flex items-center gap-5 text-[var(--oc-muted)]">
            <VisaIcon />
            <MastercardIcon />
          </div>
        </div>
      </div>
    </footer>
  );
}
