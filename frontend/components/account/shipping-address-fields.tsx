'use client';

import type { Dictionary } from '@/lib/i18n';
import type { DeliveryCity, DeliveryCountry } from '@/lib/shipping';

export type ShippingAddressFieldValues = {
  deliveryCountryId: string;
  deliveryCityId: string;
  fullName: string;
  phone: string;
  region: string;
  postalCode: string;
  line1: string;
  line2: string;
};

type ShippingAddressFieldsProps = {
  dict: Dictionary['checkout'];
  locale: string;
  values: ShippingAddressFieldValues;
  onChange: (patch: Partial<ShippingAddressFieldValues>) => void;
  countries: DeliveryCountry[];
  cities: DeliveryCity[];
  loadingCountries?: boolean;
  loadingCities?: boolean;
  onCountryChange?: (countryId: string) => void;
  readOnlyCountry?: boolean;
};

export function ShippingAddressFields({
  dict,
  locale,
  values,
  onChange,
  countries,
  cities,
  loadingCountries = false,
  loadingCities = false,
  onCountryChange,
  readOnlyCountry = false
}: ShippingAddressFieldsProps) {
  const selectedCountry = countries.find((country) => country.id === values.deliveryCountryId);
  const countryLabel = (country: DeliveryCountry) =>
    locale === 'ka' && country.nameGe ? country.nameGe : country.nameEn;
  const cityLabel = (city: DeliveryCity) =>
    locale === 'ka' && city.nameGe ? city.nameGe : city.nameEn;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        {readOnlyCountry ? (
          <div className="block space-y-1">
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--oc-muted)]">
              {dict.country}
            </span>
            <p className="oc-input bg-[var(--oc-bg-secondary)] text-[var(--oc-ink)]">
              {loadingCountries
                ? dict.loading
                : selectedCountry
                  ? countryLabel(selectedCountry)
                  : 'Georgia'}
            </p>
          </div>
        ) : (
          <label className="block space-y-1">
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--oc-muted)]">
              {dict.country}
            </span>
            <select
              className="oc-input"
              value={values.deliveryCountryId}
              onChange={(event) => {
                onCountryChange?.(event.target.value);
                onChange({ deliveryCountryId: event.target.value, deliveryCityId: '' });
              }}
              disabled={loadingCountries}
              required
            >
              <option value="">{loadingCountries ? dict.loading : dict.selectCountry}</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {countryLabel(country)}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block space-y-1">
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--oc-muted)]">
            {dict.city}
          </span>
          <select
            className="oc-input"
            value={values.deliveryCityId}
            onChange={(event) => onChange({ deliveryCityId: event.target.value })}
            disabled={loadingCities || !values.deliveryCountryId}
            required
          >
            <option value="">{loadingCities ? dict.loading : dict.selectCity}</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {cityLabel(city)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <input
          className="oc-input"
          placeholder={dict.fullName}
          value={values.fullName}
          onChange={(event) => onChange({ fullName: event.target.value })}
          required
        />
        <input
          className="oc-input"
          placeholder={dict.phone}
          value={values.phone}
          onChange={(event) => onChange({ phone: event.target.value })}
        />
        <input
          className="oc-input"
          placeholder={dict.region}
          value={values.region}
          onChange={(event) => onChange({ region: event.target.value })}
        />
        <input
          className="oc-input"
          placeholder={dict.postalCode}
          value={values.postalCode}
          onChange={(event) => onChange({ postalCode: event.target.value })}
        />
      </div>

      <input
        className="oc-input"
        placeholder={dict.address1}
        value={values.line1}
        onChange={(event) => onChange({ line1: event.target.value })}
        required
      />
      <input
        className="oc-input"
        placeholder={dict.address2}
        value={values.line2}
        onChange={(event) => onChange({ line2: event.target.value })}
      />
    </div>
  );
}

export const emptyAddressValues = (): ShippingAddressFieldValues => ({
  deliveryCountryId: '',
  deliveryCityId: '',
  fullName: '',
  phone: '',
  region: '',
  postalCode: '',
  line1: '',
  line2: ''
});
