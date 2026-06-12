'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { RequireAuth } from '@/components/auth/require-auth';
import { apiRequest } from '@/lib/api';
import { useCurrency } from '@/components/providers/currency-provider';
import { useI18n } from '@/components/providers/i18n-provider';
import { useCart } from '@/lib/cart';
import { PaymentMethodPicker } from '@/components/checkout/payment-method-picker';
import { ShippingMethodPicker } from '@/components/checkout/shipping-method-picker';
import { fetchPaymentConfig, startIpayPayment, type PaymentConfig } from '@/lib/payments';
import { DeliveryComingSoon } from '@/components/storefront/delivery-coming-soon';
import {
  fetchDeliveryCities,
  fetchDeliveryCountries,
  fetchDeliveryMethods,
  fetchShippingQuote,
  type DeliveryCity,
  type DeliveryCountry,
  type DeliveryMethod,
  type DeliveryMethodKey,
  type ShippingQuote
} from '@/lib/shipping';
import { PURCHASE_ENABLED } from '@/lib/storefront';

const defaultPaymentConfig: PaymentConfig = { card: false };

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const { formatPrice } = useCurrency();
  const { dict, locale } = useI18n();
  const t = dict.checkout;
  const [countries, setCountries] = useState<DeliveryCountry[]>([]);
  const [cities, setCities] = useState<DeliveryCity[]>([]);
  const [methods, setMethods] = useState<DeliveryMethod[]>([]);
  const [deliveryCountryId, setDeliveryCountryId] = useState('');
  const [deliveryCityId, setDeliveryCityId] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethodKey | ''>('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>(defaultPaymentConfig);
  const [busy, setBusy] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCountries() {
      setLoadingCountries(true);
      try {
        const data = await fetchDeliveryCountries();
        if (cancelled) return;
        setCountries(data);
        const georgia = data.find((country) => country.abbr === 'GE');
        if (georgia) {
          setDeliveryCountryId(georgia.id);
        } else if (data[0]) {
          setDeliveryCountryId(data[0].id);
        }
      } catch {
        if (!cancelled) {
          setError(t.countriesLoadFailed);
        }
      } finally {
        if (!cancelled) {
          setLoadingCountries(false);
        }
      }
    }

    void loadCountries();
    return () => {
      cancelled = true;
    };
  }, [t.countriesLoadFailed]);

  useEffect(() => {
    if (!deliveryCountryId) return;

    let cancelled = false;
    setDeliveryCityId('');
    setDeliveryMethod('');
    setQuote(null);

    async function loadCitiesAndMethods() {
      setLoadingCities(true);
      setLoadingMethods(true);
      try {
        const [cityData, methodData] = await Promise.all([
          fetchDeliveryCities(deliveryCountryId),
          fetchDeliveryMethods(deliveryCountryId)
        ]);

        if (cancelled) return;

        setCities(cityData);
        setMethods(methodData);

        const tbilisi = cityData.find((city) => city.nameEn.toLowerCase().includes('tbilisi'));
        if (tbilisi) {
          setDeliveryCityId(tbilisi.id);
        } else if (cityData[0]) {
          setDeliveryCityId(cityData[0].id);
        }

        const recommended = methodData.find((method) => method.recommended) ?? methodData[0];
        if (recommended) {
          setDeliveryMethod(recommended.value);
        }
      } catch {
        if (!cancelled) {
          setError(t.citiesLoadFailed);
        }
      } finally {
        if (!cancelled) {
          setLoadingCities(false);
          setLoadingMethods(false);
        }
      }
    }

    void loadCitiesAndMethods();
    return () => {
      cancelled = true;
    };
  }, [deliveryCountryId, t.citiesLoadFailed]);

  useEffect(() => {
    if (!deliveryCountryId || !deliveryCityId || !deliveryMethod || !items.length) {
      setQuote(null);
      return;
    }

    const countryId = deliveryCountryId;
    const cityId = deliveryCityId;
    const method = deliveryMethod;

    let cancelled = false;

    async function loadQuote() {
      setLoadingQuote(true);
      try {
        const payload = await fetchShippingQuote({
          items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
          deliveryCountryId: countryId,
          deliveryCityId: cityId,
          deliveryMethod: method
        });

        if (!cancelled) {
          setQuote(payload);
        }
      } catch {
        if (!cancelled) {
          setQuote(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingQuote(false);
        }
      }
    }

    void loadQuote();
    return () => {
      cancelled = true;
    };
  }, [deliveryCountryId, deliveryCityId, deliveryMethod, items]);

  const shippingIsFree = Boolean(quote?.freeShipping) || Number(quote?.shippingCost ?? 0) === 0;
  const shippingEstimate = shippingIsFree ? 0 : Number(quote?.shippingCost ?? 0);
  const total = useMemo(() => subtotal + shippingEstimate, [subtotal, shippingEstimate]);

  useEffect(() => {
    let cancelled = false;
    void fetchPaymentConfig().then((config) => {
      if (!cancelled) {
        setPaymentConfig(config);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCountry = countries.find((country) => country.id === deliveryCountryId);
  const countryLabel = (country: DeliveryCountry) =>
    locale === 'ka' && country.nameGe ? country.nameGe : country.nameEn;
  const cityLabel = (city: DeliveryCity) =>
    locale === 'ka' && city.nameGe ? city.nameGe : city.nameEn;

  async function onCreateOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem('auth_token');
    if (!token) {
      setError(t.loginRequired);
      return;
    }

    if (!items.length) {
      setError(t.cartEmpty);
      return;
    }

    if (!deliveryCountryId || !deliveryCityId || !deliveryMethod) {
      setError(t.deliverySelectionRequired);
      return;
    }

    if (!paymentConfig.card) {
      setError(t.paymentMethods.card.unavailable);
      return;
    }

    setBusy(true);

    try {
      const order = await apiRequest<{ id: string; orderNumber: string; status: string }>('/orders', token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
          deliveryCountryId,
          deliveryCityId,
          deliveryMethod,
          shippingAddress: {
            fullName,
            phone: phone || undefined,
            region: region || undefined,
            postalCode: postalCode || undefined,
            line1,
            line2: line2 || undefined
          }
        })
      });

      setSuccess(t.cardRedirecting);
      const ipay = await startIpayPayment(token, order.id);
      window.location.href = ipay.paymentUrl;
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t.failed);
    } finally {
      setBusy(false);
    }
  }

  if (!PURCHASE_ENABLED) {
    return (
      <RequireAuth>
        <main className="oc-section">
          <div className="oc-container max-w-2xl">
            <DeliveryComingSoon />
          </div>
        </main>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
    {!items.length ? (
      <main className="oc-section">
        <div className="oc-container max-w-4xl">
          <h1 className="oc-heading">{t.title}</h1>
          <p className="mt-3 text-sm text-[var(--oc-muted)]">{t.empty}</p>
          <Link href="/products" className="oc-link mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.14em]">
            {t.browseProducts}
          </Link>
        </div>
      </main>
    ) : (
    <main className="oc-section">
      <div className="oc-container grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="oc-surface space-y-4 p-5"
        >
          <h1 className="font-display text-3xl uppercase tracking-[0.1em]">{t.title}</h1>
          <p className="text-sm text-[var(--oc-muted)]">{t.georgianPostNote}</p>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--oc-brand)]">{t.worldwideComingSoon}</p>

          <form onSubmit={onCreateOrder} className="mt-2 space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="block space-y-1">
                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--oc-muted)]">
                  {t.country}
                </span>
                <p className="oc-input bg-[var(--oc-bg-secondary)] text-[var(--oc-ink)]">
                  {loadingCountries
                    ? t.loading
                    : selectedCountry
                      ? countryLabel(selectedCountry)
                      : 'Georgia'}
                </p>
              </div>

              <label className="block space-y-1">
                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--oc-muted)]">
                  {t.city}
                </span>
                <select
                  className="oc-input"
                  value={deliveryCityId}
                  onChange={(e) => setDeliveryCityId(e.target.value)}
                  disabled={loadingCities || !deliveryCountryId}
                  required
                >
                  <option value="">{loadingCities ? t.loading : t.selectCity}</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {cityLabel(city)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <ShippingMethodPicker
              dict={t}
              methods={methods}
              selectedMethod={deliveryMethod}
              quote={quote}
              loadingQuote={loadingQuote}
              formatPrice={formatPrice}
              onSelect={setDeliveryMethod}
            />

            <div className="grid gap-3 md:grid-cols-2">
              <input className="oc-input" placeholder={t.fullName} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              <input className="oc-input" placeholder={t.phone} value={phone} onChange={(e) => setPhone(e.target.value)} />
              <input className="oc-input" placeholder={t.region} value={region} onChange={(e) => setRegion(e.target.value)} />
              <input className="oc-input" placeholder={t.postalCode} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            </div>

            <input className="oc-input" placeholder={t.address1} value={line1} onChange={(e) => setLine1(e.target.value)} required />
            <input className="oc-input" placeholder={t.address2} value={line2} onChange={(e) => setLine2(e.target.value)} />

            <PaymentMethodPicker dict={t} config={paymentConfig} />

            <button
              disabled={busy || loadingQuote || !quote || !paymentConfig.card}
              type="submit"
              className="oc-btn-primary"
            >
              {busy ? t.creating : t.createOrder}
            </button>
          </form>

          {error && <p className="text-sm text-red-700">{error}</p>}
          {success && <p className="text-sm text-green-700">{success}</p>}
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          className="oc-surface h-fit p-5"
        >
          <h2 className="font-display text-2xl uppercase tracking-[0.1em]">{t.summary}</h2>
        <div className="mt-4 space-y-2 text-sm">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <span>{item.title}</span>
              <span>{formatPrice(item.price)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-[var(--oc-line)] pt-3 text-sm">
          <div className="flex items-center justify-between">
            <span>{t.subtotal}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span>
              {t.shipping} {quote ? `(${quote.shippingZone.name})` : selectedCountry ? `(${countryLabel(selectedCountry)})` : ''}
            </span>
            <span>
              {loadingQuote ? '...' : shippingIsFree ? t.shippingFree : formatPrice(shippingEstimate)}
            </span>
          </div>
          {quote && (
            <p className="mt-2 text-xs leading-relaxed text-[var(--oc-muted)]">
              {t.shippingProvider}: {t.methods.georgianPost.title}
              <br />
              {t.shippingEta}:{' '}
              {t.shippingDays
                .replace('{min}', String(quote.deliveryDays.min ?? '?'))
                .replace('{max}', String(quote.deliveryDays.max ?? '?'))}
            </p>
          )}
          <div className="mt-2 flex items-center justify-between text-base font-semibold">
            <span>{t.total}</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
        </motion.aside>
      </div>
    </main>
    )}
    </RequireAuth>
  );
}
