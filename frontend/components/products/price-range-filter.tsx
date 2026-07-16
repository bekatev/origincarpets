'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCurrency } from '@/components/providers/currency-provider';
import { convertFromUsd, formatMoney, type DisplayCurrency } from '@/lib/currency';
import { cn } from '@/lib/cn';
import type { ProductPriceFacet } from '@/lib/products';

function roundDisplay(amountUsd: number, currency: DisplayCurrency) {
  const value = convertFromUsd(amountUsd, currency);
  if (currency === 'GEL') return Math.round(value);
  return Math.round(value);
}

function formatRangeLabel(amountUsd: number, currency: DisplayCurrency, openEnded = false) {
  const rounded = roundDisplay(amountUsd, currency);
  const prefix =
    currency === 'USD' ? 'US$' : currency === 'EUR' ? '€' : currency === 'GEL' ? '₾' : '';
  const formatted = rounded.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return `${prefix}${formatted}${openEnded ? '+' : ''}`;
}

export function PriceRangeFilter({
  facet,
  currentMin,
  currentMax,
  label,
  onCommit
}: {
  facet: ProductPriceFacet;
  currentMin?: string;
  currentMax?: string;
  label: string;
  /** Called with USD values ('' means unbounded) when the user releases a slider thumb. */
  onCommit?: (minPrice: string, maxPrice: string) => void;
}) {
  const { currency } = useCurrency();
  const absoluteMin = facet.min;
  const absoluteMax = Math.max(facet.max, absoluteMin + 1);
  const step = absoluteMax - absoluteMin > 500 ? 5 : 1;

  const initialMin = (() => {
    const parsed = currentMin ? Number(currentMin) : NaN;
    if (!Number.isFinite(parsed)) return absoluteMin;
    return Math.min(absoluteMax, Math.max(absoluteMin, parsed));
  })();
  const initialMax = (() => {
    const parsed = currentMax ? Number(currentMax) : NaN;
    if (!Number.isFinite(parsed)) return absoluteMax;
    return Math.min(absoluteMax, Math.max(absoluteMin, parsed));
  })();

  const [minValue, setMinValue] = useState(initialMin);
  const [maxValue, setMaxValue] = useState(Math.max(initialMin, initialMax));

  // Keep thumbs in sync when the URL changes externally (e.g. "Clear all").
  useEffect(() => {
    setMinValue(initialMin);
    setMaxValue(Math.max(initialMin, initialMax));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMin, currentMax, absoluteMin, absoluteMax]);

  const peak = useMemo(() => Math.max(1, ...facet.buckets), [facet.buckets]);
  const span = absoluteMax - absoluteMin || 1;
  const minPct = ((minValue - absoluteMin) / span) * 100;
  const maxPct = ((maxValue - absoluteMin) / span) * 100;
  const atFullRange = minValue <= absoluteMin && maxValue >= absoluteMax;
  const maxIsOpen = maxValue >= absoluteMax;

  const onMinChange = (next: number) => {
    const clamped = Math.min(next, maxValue - step);
    setMinValue(Math.max(absoluteMin, clamped));
  };

  const onMaxChange = (next: number) => {
    const clamped = Math.max(next, minValue + step);
    setMaxValue(Math.min(absoluteMax, clamped));
  };

  const commit = () => {
    if (!onCommit) return;
    const fullRange = minValue <= absoluteMin && maxValue >= absoluteMax;
    const openMax = maxValue >= absoluteMax;
    onCommit(fullRange ? '' : String(minValue), fullRange || openMax ? '' : String(maxValue));
  };

  if (!facet.buckets.length || absoluteMax <= absoluteMin) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="oc-kicker">{label}</p>
        <p className="text-sm font-medium text-[var(--oc-ink)]">
          {formatRangeLabel(minValue, currency)} – {formatRangeLabel(maxValue, currency, maxIsOpen)}
        </p>
      </div>

      {/* Histogram */}
      <div className="relative h-12" aria-hidden>
        <div className="flex h-full items-end gap-px px-0.5">
          {facet.buckets.map((count, index) => {
            const bucketStart = absoluteMin + (span * index) / facet.buckets.length;
            const bucketEnd = absoluteMin + (span * (index + 1)) / facet.buckets.length;
            const inRange = bucketEnd >= minValue && bucketStart <= maxValue;
            const height = Math.max(8, Math.round((count / peak) * 100));
            return (
              <div
                key={index}
                className={cn(
                  'min-w-0 flex-1 rounded-t-sm bg-[var(--oc-ink)] transition-opacity',
                  inRange ? 'opacity-60' : 'opacity-20'
                )}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Dual range slider */}
      <div className="relative h-8 touch-none">
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[var(--oc-line)]" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[var(--oc-ink)]"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        <input
          type="range"
          min={absoluteMin}
          max={absoluteMax}
          step={step}
          value={minValue}
          onChange={(event) => onMinChange(Number(event.target.value))}
          onPointerUp={commit}
          onKeyUp={commit}
          aria-label={`${label} min`}
          className="price-range-thumb absolute inset-0 z-20 w-full appearance-none bg-transparent"
        />
        <input
          type="range"
          min={absoluteMin}
          max={absoluteMax}
          step={step}
          value={maxValue}
          onChange={(event) => onMaxChange(Number(event.target.value))}
          onPointerUp={commit}
          onKeyUp={commit}
          aria-label={`${label} max`}
          className="price-range-thumb absolute inset-0 z-30 w-full appearance-none bg-transparent"
        />
      </div>

      <p className="text-[11px] text-[var(--oc-muted)]">
        {formatMoney(absoluteMin, currency)} – {formatMoney(absoluteMax, currency)}
      </p>

      {/* When used inside a form, submit USD values; omit when full range so no filter is applied */}
      {!onCommit && (
        <>
          <input type="hidden" name="minPrice" value={atFullRange ? '' : String(minValue)} />
          <input type="hidden" name="maxPrice" value={atFullRange || maxIsOpen ? '' : String(maxValue)} />
        </>
      )}
    </div>
  );
}
