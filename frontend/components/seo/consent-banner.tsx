'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/components/providers/i18n-provider';
import { getGaMeasurementId, getGoogleAdsId, getMetaPixelId } from '@/lib/tracking';
import {
  CONSENT_RESET_EVENT,
  isConsentRequiredRegion,
  readConsent,
  writeConsent,
  type ConsentValue
} from '@/lib/consent';

/**
 * Opt-in banner for EEA / UK / CH visitors when ad pixels are configured.
 * Everyone can reopen it from the footer "Cookie settings" link to change their choice.
 */
export function ConsentBanner() {
  const { dict } = useI18n();
  const t = dict.consent;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const configured = Boolean(getMetaPixelId() || getGaMeasurementId() || getGoogleAdsId());
    if (!configured) return;
    if (!readConsent() && isConsentRequiredRegion()) setVisible(true);

    const reopen = () => setVisible(true);
    window.addEventListener(CONSENT_RESET_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_RESET_EVENT, reopen);
  }, []);

  if (!visible) return null;

  function choose(value: ConsentValue) {
    writeConsent(value);
    setVisible(false);
  }

  return (
    <div
      role="dialog"
      aria-label={t.title}
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-[var(--oc-line)] bg-[var(--oc-bg)] px-4 py-4 shadow-[var(--oc-shadow-lift)] sm:px-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl space-y-1">
          <p className="text-sm font-medium text-[var(--oc-ink)]">{t.title}</p>
          <p className="text-xs leading-relaxed text-[var(--oc-muted)]">{t.body}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button type="button" className="oc-btn-secondary" onClick={() => choose('rejected')}>
            {t.reject}
          </button>
          <button type="button" className="oc-btn-primary" onClick={() => choose('accepted')}>
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
