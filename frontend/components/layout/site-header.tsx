'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useState } from 'react';
import { CartLink } from '@/components/cart/cart-link';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { useI18n } from '@/components/providers/i18n-provider';

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { dict } = useI18n();

  const navItems: Array<{ href: Route; label: string }> = [
    { href: '/#about-us' as Route, label: dict.nav.about },
    { href: '/products', label: dict.nav.carpets },
    { href: '/#carpet-origin' as Route, label: dict.nav.origin },
    { href: '/#guides-policies' as Route, label: dict.nav.guides },
    { href: '/#contact-us' as Route, label: dict.nav.contact },
    { href: '/#social-media' as Route, label: dict.nav.social },
    { href: '/#virtual-appointment' as Route, label: dict.nav.appointment }
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--oc-line)] bg-[var(--oc-paper)]/95 backdrop-blur">
      <div className="oc-container py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="font-display text-xl uppercase tracking-[0.14em]" onClick={() => setOpen(false)}>
            Origin Carpets
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <LanguageSwitcher />
            <Link href="/login" className="oc-btn-secondary px-3 py-2">
              {dict.common.login}
            </Link>
            <CartLink />
          </div>

          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? dict.common.close : dict.common.menu}
            onClick={() => setOpen((prev) => !prev)}
            className="oc-btn-secondary px-3 py-2 md:hidden"
          >
            {open ? dict.common.close : dict.common.menu}
          </button>
        </div>

        <nav className="mt-4 hidden flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--oc-line)] pt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--oc-muted)] md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[var(--oc-ink)]">
              {item.label}
            </Link>
          ))}
        </nav>

        {open && (
          <nav className="mt-4 border-t border-[var(--oc-line)] pt-3 md:hidden">
            <div className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--oc-muted)]">
              {navItems.map((item) => (
                <Link key={`mobile-${item.href}`} href={item.href} className="px-1 py-2 hover:text-[var(--oc-ink)]" onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              ))}
              <Link href="/login" className="px-1 py-2 hover:text-[var(--oc-ink)]" onClick={() => setOpen(false)}>
                {dict.common.login}
              </Link>
              <LanguageSwitcher />
              <div className="pt-2">
                <CartLink />
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
