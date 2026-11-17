'use client';

import { useEffect, useRef } from 'react';
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
 * Loads GA / Google Ads (when env IDs are set), records ad-click attribution,
 * and fires PageView on client navigations (App Router).
 * Meta Pixel base code + first PageView live in <head> (MetaPixel) so Ads Manager can detect them.
 */
export function TrackingScripts() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRoute = useRef(true);

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
    if (isFirstRoute.current) {
      // First Meta PageView already fired from <head> MetaPixel base code.
      isFirstRoute.current = false;
      trackPageView({ includeMeta: false });
      return;
    }
    trackPageView();
  }, [pathname, searchParams]);

  return null;
}
