'use client';

import Link from 'next/link';
import { BrandLogo } from '@/components/brand/brand-logo';
import { useAuth } from '@/components/providers/auth-provider';
import { useI18n } from '@/components/providers/i18n-provider';

export function SiteFooter() {
  const { isAuthenticated, ready } = useAuth();
  const { dict } = useI18n();
  const signedIn = ready && isAuthenticated;

  return (
    <footer className="border-t border-[var(--oc-line)] bg-[var(--oc-bg)]">
      <div className="oc-container py-16 sm:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block" aria-label="Origin Carpets">
              <BrandLogo size="sm" />
            </Link>
            <p className="oc-body mt-6 max-w-xs">{dict.footer.description}</p>
          </div>

          <div>
            <p className="oc-eyebrow mb-5">{dict.footer.shop}</p>
            <ul className="space-y-3 text-sm text-[var(--oc-ink)]">
              <li>
                <Link href="/products" className="hover:opacity-50">
                  {dict.footer.productCatalog}
                </Link>
              </li>
              {signedIn ? (
                <>
                  <li>
                    <Link href="/cart" className="hover:opacity-50">
                      {dict.common.cart}
                    </Link>
                  </li>
                  <li>
                    <Link href="/checkout" className="hover:opacity-50">
                      {dict.footer.checkout}
                    </Link>
                  </li>
                </>
              ) : null}
            </ul>
          </div>

          <div>
            <p className="oc-eyebrow mb-5">{dict.footer.account}</p>
            <ul className="space-y-3 text-sm text-[var(--oc-ink)]">
              {signedIn ? (
                <li>
                  <Link href="/orders" className="hover:opacity-50">
                    {dict.footer.myOrders}
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link href="/login" className="hover:opacity-50">
                      {dict.common.login}
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:opacity-50">
                      {dict.footer.register}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div>
            <p className="oc-eyebrow mb-5">{dict.home.contactTitle}</p>
            <ul className="space-y-3 text-sm text-[var(--oc-muted)]">
              <li>{dict.homeExtra.phone}</li>
              <li>
                <a href={`mailto:${dict.homeExtra.email.replace('E. ', '').replace('ელ. ', '')}`} className="hover:text-[var(--oc-ink)]">
                  info@origincarpets.com
                </a>
              </li>
              <li>{dict.homeExtra.address}</li>
            </ul>
          </div>
        </div>

        <div className="oc-divider mt-14 flex flex-col items-center justify-between gap-4 pt-8 text-[11px] uppercase tracking-[0.2em] text-[var(--oc-muted)] sm:flex-row">
          <p>© {new Date().getFullYear()} Origin Carpets</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/#guides-policies" className="hover:text-[var(--oc-ink)]">
              {dict.home.policyPrivacy}
            </Link>
            <Link href="/#guides-policies" className="hover:text-[var(--oc-ink)]">
              {dict.home.policyReturn}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
