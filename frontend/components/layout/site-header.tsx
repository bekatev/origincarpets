'use client';

import Link from 'next/link';
import { BrandLogo } from '@/components/brand/brand-logo';
import type { Route } from 'next';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AccountNav, AccountNavMobile } from '@/components/layout/account-nav';
import { CartLink } from '@/components/cart/cart-link';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { useI18n } from '@/components/providers/i18n-provider';

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { dict } = useI18n();

  const primaryNav: Array<{ href: Route; label: string }> = [
    { href: '/products', label: dict.nav.shop },
    { href: '/#about-us' as Route, label: dict.nav.about },
    { href: '/#contact-us' as Route, label: dict.nav.contact }
  ];

  const allNav: Array<{ href: Route; label: string }> = [
    ...primaryNav,
    { href: '/#carpet-origin' as Route, label: dict.nav.origin },
    { href: '/#guides-policies' as Route, label: dict.nav.guides }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--oc-line)] bg-[var(--oc-bg)]/95 backdrop-blur-sm">
      <div className="oc-container">
        <div className="hidden items-center justify-between py-8 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <nav className="flex items-center gap-8">
            {primaryNav.map((item) => (
              <Link key={item.href} href={item.href} className="oc-nav-link">
                {item.label}
              </Link>
            ))}
          </nav>

          <Link href="/" className="justify-self-center px-6" onClick={() => setOpen(false)} aria-label="Origin Carpets">
            <BrandLogo size="md" />
          </Link>

          <div className="flex items-center justify-end gap-6">
            <ThemeToggle />
            <LanguageSwitcher />
            <AccountNav onNavigate={() => setOpen(false)} />
            <CartLink />
          </div>
        </div>

        <div className="flex items-center justify-between py-5 lg:hidden">
          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? dict.common.close : dict.common.menu}
            onClick={() => setOpen((prev) => !prev)}
            className="oc-nav-link"
          >
            {open ? dict.common.close : dict.common.menu}
          </button>

          <Link href="/" onClick={() => setOpen(false)} aria-label="Origin Carpets">
            <BrandLogo size="sm" iconOnly />
          </Link>

          <div className="flex items-center gap-5">
            <ThemeToggle />
            <CartLink />
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-[var(--oc-line)] lg:hidden"
            >
              <nav className="flex flex-col gap-0 py-4">
                {allNav.map((item) => (
                  <Link
                    key={`m-${item.href}`}
                    href={item.href}
                    className="border-b border-[var(--oc-line)] py-4 text-sm uppercase tracking-[0.18em] last:border-0"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="flex items-center justify-between pt-6">
                  <div className="flex items-center gap-5">
                    <ThemeToggle />
                    <LanguageSwitcher />
                  </div>
                  <AccountNavMobile onNavigate={() => setOpen(false)} />
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
