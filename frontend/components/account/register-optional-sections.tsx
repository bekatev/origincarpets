'use client';

import { useEffect, useState } from 'react';
import { PaymentMethodPicker, type PaymentMethodKey } from '@/components/checkout/payment-method-picker';
import {
  emptyAddressValues,
  ShippingAddressFields,
  type ShippingAddressFieldValues
} from '@/components/account/shipping-address-fields';
import { useI18n } from '@/components/providers/i18n-provider';
import type { Dictionary } from '@/lib/i18n';
import { fetchPaymentConfig, type PaymentConfig } from '@/lib/payments';
import {
  fetchDeliveryCities,
  fetchDeliveryCountries,
  type DeliveryCity,
  type DeliveryCountry
} from '@/lib/shipping';

type RegisterOptionalSectionsProps = {
  dict: Dictionary['auth'];
  checkoutDict: Dictionary['checkout'];
  includeShipping: boolean;
  includePayment: boolean;
  onIncludeShippingChange: (value: boolean) => void;
  onIncludePaymentChange: (value: boolean) => void;
  addressValues: ShippingAddressFieldValues;
  onAddressChange: (patch: Partial<ShippingAddressFieldValues>) => void;
  paymentMethod: PaymentMethodKey | null;
  onPaymentMethodChange: (method: PaymentMethodKey) => void;
};

export function RegisterOptionalSections({
  dict,
  checkoutDict,
  includeShipping,
  includePayment,
  onIncludeShippingChange,
  onIncludePaymentChange,
  addressValues,
  onAddressChange,
  paymentMethod,
  onPaymentMethodChange
}: RegisterOptionalSectionsProps) {
  const { locale } = useI18n();
  const [countries, setCountries] = useState<DeliveryCountry[]>([]);
  const [cities, setCities] = useState<DeliveryCity[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({ card: false });

  useEffect(() => {
    if (!includeShipping) return;

    let cancelled = false;
    setLoadingCountries(true);

    void fetchDeliveryCountries()
      .then((data) => {
        if (cancelled) return;
        setCountries(data);
        const georgia = data.find((country) => country.abbr === 'GE') ?? data[0];
        if (georgia) {
          onAddressChange({ deliveryCountryId: georgia.id });
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingCountries(false);
      });

    return () => {
      cancelled = true;
    };
  }, [includeShipping, onAddressChange]);

  useEffect(() => {
    if (!includeShipping || !addressValues.deliveryCountryId) return;

    let cancelled = false;
    setLoadingCities(true);

    void fetchDeliveryCities(addressValues.deliveryCountryId)
      .then((data) => {
        if (cancelled) return;
        setCities(data);
        const tbilisi = data.find((city) => city.nameEn.toLowerCase().includes('tbilisi')) ?? data[0];
        if (tbilisi) {
          onAddressChange({ deliveryCityId: tbilisi.id });
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingCities(false);
      });

    return () => {
      cancelled = true;
    };
  }, [includeShipping, addressValues.deliveryCountryId, onAddressChange]);

  useEffect(() => {
    if (!includePayment) return;
    void fetchPaymentConfig().then((config) => {
      setPaymentConfig(config);
      if (!paymentMethod) {
        if (config.card) onPaymentMethodChange('CARD');
        else if (config.bankTransfer !== false) onPaymentMethodChange('BANK_TRANSFER');
        else if (config.paypal) onPaymentMethodChange('PAYPAL');
      }
    });
  }, [includePayment, onPaymentMethodChange, paymentMethod]);

  return (
    <div className="space-y-4 border-t border-[var(--oc-line)] pt-4">
      <div className="oc-surface-muted space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-sm uppercase tracking-[0.1em]">{dict.shippingSectionTitle}</h2>
            <p className="mt-1 text-xs text-[var(--oc-muted)]">{dict.shippingSectionHint}</p>
          </div>
          {!includeShipping ? (
            <button
              type="button"
              className="oc-btn-secondary shrink-0 text-xs"
              onClick={() => onIncludeShippingChange(true)}
            >
              {dict.addSection}
            </button>
          ) : (
            <button
              type="button"
              className="text-xs uppercase tracking-[0.12em] text-[var(--oc-muted)] underline-offset-2 hover:underline"
              onClick={() => {
                onIncludeShippingChange(false);
                onAddressChange(emptyAddressValues());
              }}
            >
              {dict.skipSection}
            </button>
          )}
        </div>

        {includeShipping ? (
          <ShippingAddressFields
            dict={checkoutDict}
            locale={locale}
            values={addressValues}
            onChange={onAddressChange}
            countries={countries}
            cities={cities}
            loadingCountries={loadingCountries}
            loadingCities={loadingCities}
            onCountryChange={() => onAddressChange({ deliveryCityId: '' })}
            readOnlyCountry
          />
        ) : null}
      </div>

      <div className="oc-surface-muted space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-sm uppercase tracking-[0.1em]">{dict.paymentSectionTitle}</h2>
            <p className="mt-1 text-xs text-[var(--oc-muted)]">{dict.paymentSectionHint}</p>
          </div>
          {!includePayment ? (
            <button
              type="button"
              className="oc-btn-secondary shrink-0 text-xs"
              onClick={() => onIncludePaymentChange(true)}
            >
              {dict.addSection}
            </button>
          ) : (
            <button
              type="button"
              className="text-xs uppercase tracking-[0.12em] text-[var(--oc-muted)] underline-offset-2 hover:underline"
              onClick={() => onIncludePaymentChange(false)}
            >
              {dict.skipSection}
            </button>
          )}
        </div>

        {includePayment ? (
          <PaymentMethodPicker
            dict={checkoutDict}
            config={paymentConfig}
            value={paymentMethod}
            onChange={onPaymentMethodChange}
            selectable
          />
        ) : null}
      </div>
    </div>
  );
}
