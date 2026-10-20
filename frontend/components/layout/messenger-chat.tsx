'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/components/providers/i18n-provider';
import { trackLead } from '@/lib/tracking';

/**
 * Floating chat widget — Messenger + WhatsApp.
 * (Meta retired the embeddable chat plugin, so m.me is the supported path.)
 */
const MESSENGER_URL = 'https://m.me/carpetsgallerytbilisi';
const WHATSAPP_URL = 'https://wa.me/995577405311';

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

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.01Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 9.5c.3 1.6 1.7 3.2 3.3 3.9l1.1-.6c.2-.1.5-.1.6.1l.7 1.5c.1.3.1.5-.1.7-.7.6-1.6.9-2.6.9-3.2 0-5.8-2.6-5.8-5.8 0-1 .3-1.9.9-2.6.2-.2.4-.2.7-.1l1.5.7c.2.1.3.4.1.6l-.6 1.1Z"
        stroke="currentColor"
        strokeWidth="1.5"
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
          <div className="space-y-3 px-5 py-4">
            <p className="text-sm leading-relaxed text-[var(--oc-muted)]">{t.body}</p>
            <a
              href={MESSENGER_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackLead({
                  contentIds: ['messenger_chat'],
                  contentName: 'Messenger Chat'
                })
              }
              className="inline-flex w-full items-center justify-center gap-2 border border-[var(--oc-ink)] bg-[var(--oc-ink)] px-4 py-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--oc-bg)] transition hover:opacity-80"
            >
              <MessengerIcon />
              {t.cta}
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackLead({
                  contentIds: ['whatsapp_chat'],
                  contentName: 'WhatsApp Chat'
                })
              }
              className="inline-flex w-full items-center justify-center gap-2 border border-[var(--oc-line)] bg-[var(--oc-bg)] px-4 py-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--oc-ink)] transition hover:border-[var(--oc-ink)]"
            >
              <WhatsAppIcon />
              {t.ctaWhatsapp}
            </a>
            <p className="text-center text-[10px] text-[var(--oc-muted)]">{t.note}</p>
          </div>
        </div>
      )}
    </div>
  );
}
