'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { captureAttribution } from '@/lib/attribution';
import { CONSENT_EVENT, type ConsentValue } from '@/lib/consent';
import {
  applyConsentChoice,
  initTrackingScripts,
  trackMetaPageView,
  trackPageView
} from '@/lib/tracking';

/**
 * Loads Meta Pixel + GA4 + Google Ads (when env IDs are set), records ad-click attribution,
 * and fires PageView on client navigations (App Router).
 */
export function TrackingScripts() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    initTrackingScripts();

    const onConsent = (event: Event) => {
      const value = (event as CustomEvent<ConsentValue>).detail;
      applyConsentChoice(value);
      if (value === 'accepted') trackMetaPageView();
    };
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, []);

  useEffect(() => {
    captureAttribution();
    trackPageView();
  }, [pathname, searchParams]);

  return null;
}
