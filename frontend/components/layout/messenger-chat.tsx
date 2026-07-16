'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/components/providers/i18n-provider';

/**
 * Floating chat widget wired to the gallery's Facebook Page.
 * Visitors write via Messenger; the team replies from the Page inbox.
 * (Meta retired the embeddable chat plugin, so m.me is the supported path.)
 */
const MESSENGER_URL = 'https://m.me/carpetsgallerytbilisi';

function MessengerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2C6.477 2 2 6.145 2 11.26c0 2.913 1.454 5.512 3.726 7.21V22l3.405-1.869c.909.252 1.871.388 2.869.388 5.523 0 10-4.145 10-9.259C22 6.145 17.523 2 12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="m6.5 14 3.13-3.326a.8.8 0 0 1 1.144-.022l2.252 2.148a.8.8 0 0 0 1.144-.021L17.5 9.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MessengerChat() {
  const { dict } = useI18n();
  const t = dict.chat;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="inline-flex items-center gap-2 border border-[var(--oc-line)] bg-[var(--oc-bg)] px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--oc-ink)] transition hover:opacity-60"
      >
        <MessengerIcon />
        <span className="hidden sm:inline">{t.open}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t.title}
          className="fixed inset-x-4 bottom-20 border border-[var(--oc-line)] bg-[var(--oc-bg)] shadow-[var(--oc-shadow-lift)] sm:absolute sm:inset-x-auto sm:bottom-full sm:right-0 sm:mb-2 sm:w-72"
        >
          <div className="border-b border-[var(--oc-line)] px-5 py-4">
            <p className="font-display text-base uppercase tracking-[0.08em] text-[var(--oc-ink)]">{t.title}</p>
            <p className="mt-1 text-xs text-[var(--oc-muted)]">{t.subtitle}</p>
          </div>
          <div className="space-y-4 px-5 py-4">
            <p className="text-sm leading-relaxed text-[var(--oc-muted)]">{t.body}</p>
            <a
              href={MESSENGER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 border border-[var(--oc-ink)] bg-[var(--oc-ink)] px-4 py-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--oc-bg)] transition hover:opacity-80"
            >
              <MessengerIcon />
              {t.cta}
            </a>
            <p className="text-center text-[10px] text-[var(--oc-muted)]">{t.note}</p>
          </div>
        </div>
      )}
    </div>
  );
}
