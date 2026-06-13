'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  createSavedAddress,
  deleteSavedAddress,
  listSavedAddresses,
  updateSavedAddress,
  type AddressInput,
  type SavedAddress
} from '@/lib/account';
import { readStoredToken } from '@/lib/auth';
import { useI18n } from '@/components/providers/i18n-provider';
import {
  emptyAddressValues,
  ShippingAddressFields,
  type ShippingAddressFieldValues
} from '@/components/account/shipping-address-fields';
import {
  fetchDeliveryCities,
  fetchDeliveryCountries,
  type DeliveryCity,
  type DeliveryCountry
} from '@/lib/shipping';

function toInput(values: ShippingAddressFieldValues): AddressInput {
  return {
    deliveryCountryId: values.deliveryCountryId,
    deliveryCityId: values.deliveryCityId,
    fullName: values.fullName,
    phone: values.phone || undefined,
    region: values.region || undefined,
    postalCode: values.postalCode || undefined,
    line1: values.line1,
    line2: values.line2 || undefined
  };
}

function fromSaved(address: SavedAddress): ShippingAddressFieldValues {
  return {
    deliveryCountryId: address.deliveryCountryId ?? '',
    deliveryCityId: address.deliveryCityId ?? '',
    fullName: address.fullName,
    phone: address.phone ?? '',
    region: address.region ?? '',
    postalCode: address.postalCode ?? '',
    line1: address.line1,
    line2: address.line2 ?? ''
  };
}

export function AddressSettings() {
  const { dict, locale } = useI18n();
  const s = dict.settings;
  const checkoutDict = dict.checkout;
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [values, setValues] = useState<ShippingAddressFieldValues>(emptyAddressValues());
  const [countries, setCountries] = useState<DeliveryCountry[]>([]);
  const [cities, setCities] = useState<DeliveryCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const token = readStoredToken();
    if (!token) return;

    void Promise.all([listSavedAddresses(token), fetchDeliveryCountries()])
      .then(([addressData, countryData]) => {
        setAddresses(addressData);
        setCountries(countryData);
        if (addressData.length === 0) {
          setShowForm(true);
          const georgia = countryData.find((country) => country.abbr === 'GE') ?? countryData[0];
          if (georgia) {
            setValues((current) => ({ ...current, deliveryCountryId: georgia.id }));
          }
        }
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : s.loadFailed))
      .finally(() => setLoading(false));
  }, [s.loadFailed]);

  useEffect(() => {
    if (!values.deliveryCountryId) return;

    let cancelled = false;
    setLoadingCities(true);

    void fetchDeliveryCities(values.deliveryCountryId)
      .then((data) => {
        if (!cancelled) setCities(data);
      })
      .finally(() => {
        if (!cancelled) setLoadingCities(false);
      });

    return () => {
      cancelled = true;
    };
  }, [values.deliveryCountryId]);

  function startCreate() {
    setEditingId(null);
    setShowForm(true);
    const georgia = countries.find((country) => country.abbr === 'GE') ?? countries[0];
    setValues({
      ...emptyAddressValues(),
      deliveryCountryId: georgia?.id ?? ''
    });
    setError(null);
    setSuccess(null);
  }

  function startEdit(address: SavedAddress) {
    setEditingId(address.id);
    setShowForm(true);
    setValues(fromSaved(address));
    setError(null);
    setSuccess(null);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const token = readStoredToken();
    if (!token) return;

    setBusy(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = toInput(values);
      if (editingId) {
        const updated = await updateSavedAddress(token, editingId, payload);
        setAddresses((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await createSavedAddress(token, payload);
        setAddresses((current) => [created, ...current.filter((item) => item.id !== created.id)]);
      }
      setSuccess(s.addressSaved);
      setShowForm(false);
      setEditingId(null);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : s.saveFailed);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(addressId: string) {
    const token = readStoredToken();
    if (!token) return;

    setBusy(true);
    setError(null);

    try {
      await deleteSavedAddress(token, addressId);
      setAddresses((current) => current.filter((item) => item.id !== addressId));
      if (editingId === addressId) {
        setEditingId(null);
        setShowForm(false);
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : s.deleteFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="oc-surface space-y-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl uppercase tracking-[0.08em]">{s.addressesTitle}</h2>
          <p className="mt-1 text-sm text-[var(--oc-muted)]">{s.addressesSubtitle}</p>
        </div>
        {!showForm ? (
          <button type="button" className="oc-btn-secondary text-xs" onClick={startCreate}>
            {s.addAddress}
          </button>
        ) : null}
      </div>

      {loading ? <p className="text-sm text-[var(--oc-muted)]">{s.loading}</p> : null}

      {!loading && addresses.length > 0 ? (
        <ul className="space-y-3">
          {addresses.map((address) => (
            <li key={address.id} className="border border-[var(--oc-line)] p-4">
              <p className="font-medium">{address.fullName}</p>
              <p className="mt-1 text-sm text-[var(--oc-muted)]">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ''}
                <br />
                {address.city}
                {address.postalCode ? `, ${address.postalCode}` : ''}
                {address.phone ? ` • ${address.phone}` : ''}
              </p>
              {address.isDefault ? (
                <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-[var(--oc-brand)]">{s.defaultAddress}</p>
              ) : null}
              <div className="mt-3 flex gap-3">
                <button type="button" className="oc-link text-xs font-semibold uppercase tracking-[0.12em]" onClick={() => startEdit(address)}>
                  {s.editAddress}
                </button>
                <button
                  type="button"
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-red-700"
                  onClick={() => void onDelete(address.id)}
                  disabled={busy}
                >
                  {s.removeAddress}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {!loading && !addresses.length && !showForm ? (
        <p className="text-sm text-[var(--oc-muted)]">{s.noAddresses}</p>
      ) : null}

      {showForm ? (
        <form onSubmit={onSubmit} className="space-y-4 border-t border-[var(--oc-line)] pt-4">
          <ShippingAddressFields
            dict={checkoutDict}
            locale={locale}
            values={values}
            onChange={(patch) => setValues((current) => ({ ...current, ...patch }))}
            countries={countries}
            cities={cities}
            loadingCities={loadingCities}
            onCountryChange={() => setValues((current) => ({ ...current, deliveryCityId: '' }))}
            readOnlyCountry
          />
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="oc-btn-primary" disabled={busy}>
              {busy ? s.saving : editingId ? s.updateAddress : s.saveAddress}
            </button>
            <button
              type="button"
              className="oc-btn-secondary"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              {s.cancel}
            </button>
          </div>
        </form>
      ) : null}

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {success ? <p className="text-sm text-green-700">{success}</p> : null}
    </section>
  );
}
