'use client';

import { useCallback, useTransition } from 'react';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ProductFilterOptions, ProductListFilters } from '@/lib/products';
import { useI18n } from '@/components/providers/i18n-provider';
import { PriceRangeFilter } from '@/components/products/price-range-filter';
import { cn } from '@/lib/cn';

function RadioOption({
  name,
  value,
  label,
  checked,
  onSelect
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onSelect: (value: string) => void;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5 py-1 text-sm text-[var(--oc-ink)]">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onSelect(value)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition',
          checked
            ? 'border-[var(--oc-ink)] bg-[var(--oc-ink)]'
            : 'border-[var(--oc-line)] bg-[var(--oc-paper)] group-hover:border-[var(--oc-ink)]'
        )}
      >
        {checked ? <span className="h-1.5 w-1.5 rounded-full bg-[var(--oc-paper)]" /> : null}
      </span>
      <span className={cn('leading-5', checked ? 'font-medium' : 'text-[var(--oc-muted)] group-hover:text-[var(--oc-ink)]')}>
        {label}
      </span>
    </label>
  );
}

function RadioGroup({
  title,
  name,
  allLabel,
  options,
  current,
  onSelect
}: {
  title: string;
  name: string;
  allLabel: string;
  options: Array<{ value: string; label: string }>;
  current?: string;
  onSelect: (name: string, value: string) => void;
}) {
  if (!options.length) return null;

  return (
    <fieldset className="border-t border-[var(--oc-line)] pt-3">
      <legend className="oc-kicker pb-1">{title}</legend>
      <div className="max-h-52 space-y-0.5 overflow-y-auto pr-1">
        <RadioOption
          name={name}
          value=""
          label={allLabel}
          checked={!current}
          onSelect={(value) => onSelect(name, value)}
        />
        {options.map((option) => (
          <RadioOption
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            checked={current === option.value}
            onSelect={(value) => onSelect(name, value)}
          />
        ))}
      </div>
    </fieldset>
  );
}

export function ProductFilters({
  facets,
  current
}: {
  facets: ProductFilterOptions;
  current: ProductListFilters;
}) {
  const { dict } = useI18n();
  const f = dict.filters;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const applyParam = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [name, value] of Object.entries(updates)) {
        if (value) {
          next.set(name, value);
        } else {
          next.delete(name);
        }
      }
      next.delete('page');
      const query = next.toString();
      startTransition(() => {
        router.push((query ? `${pathname}?${query}` : pathname) as Route, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  const selectFilter = useCallback(
    (name: string, value: string) => applyParam({ [name]: value }),
    [applyParam]
  );

  const hasActiveFilters = Boolean(
    current.category ||
      current.material ||
      current.size ||
      current.origin ||
      current.color ||
      current.period ||
      current.age ||
      current.georgian ||
      current.minPrice ||
      current.maxPrice
  );

  const simpleGroups: Array<{
    name: keyof ProductListFilters & string;
    title: string;
    allLabel: string;
    options: string[];
  }> = [
    { name: 'material', title: f.material, allLabel: f.allMaterials, options: facets.materials },
    { name: 'size', title: f.size, allLabel: f.allSizes, options: facets.sizes },
    { name: 'origin', title: f.origin, allLabel: f.allOrigins, options: facets.origins },
    { name: 'color', title: f.color, allLabel: f.allColors, options: facets.colors },
    { name: 'age', title: f.age, allLabel: f.allAges, options: facets.ages },
    { name: 'period', title: f.period, allLabel: f.allPeriods, options: facets.periods }
  ];

  return (
    <aside className="lg:sticky lg:top-24 lg:z-10 lg:self-start">
      <div className="oc-surface flex max-h-[min(36rem,calc(100dvh-6.5rem))] flex-col overflow-hidden lg:max-h-[calc(100dvh-7rem)]">
        <div className="flex items-start justify-between gap-2 border-b border-[var(--oc-line)] px-4 py-3 sm:px-5">
          <div className="space-y-1">
            <h2 className="font-display text-base font-medium uppercase tracking-[0.1em]">{f.title}</h2>
            <p className="text-[11px] leading-4 text-[var(--oc-muted)]">{f.subtitle}</p>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() =>
                applyParam({
                  category: '',
                  material: '',
                  size: '',
                  origin: '',
                  color: '',
                  period: '',
                  age: '',
                  georgian: '',
                  minPrice: '',
                  maxPrice: ''
                })
              }
              className="shrink-0 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--oc-muted)] underline underline-offset-2 transition hover:text-[var(--oc-ink)]"
            >
              {f.clear}
            </button>
          )}
        </div>

        <div
          className={cn(
            'min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3 transition-opacity sm:px-5',
            isPending && 'pointer-events-none opacity-60'
          )}
        >
          {facets.price && facets.price.buckets.length > 0 ? (
            <PriceRangeFilter
              facet={facets.price}
              currentMin={current.minPrice}
              currentMax={current.maxPrice}
              label={f.price}
              onCommit={(minPrice, maxPrice) => applyParam({ minPrice, maxPrice })}
            />
          ) : null}

          <RadioGroup
            title={f.category}
            name="category"
            allLabel={f.allCategories}
            options={facets.categories.map((category) => ({
              value: category.slug,
              label: category.name
            }))}
            current={current.category}
            onSelect={selectFilter}
          />

          {simpleGroups.map((group) => (
            <RadioGroup
              key={group.name}
              title={group.title}
              name={group.name}
              allLabel={group.allLabel}
              options={group.options.map((option) => ({ value: option, label: option }))}
              current={current[group.name]}
              onSelect={selectFilter}
            />
          ))}

          <RadioGroup
            title={f.georgian}
            name="georgian"
            allLabel={f.allCarpets}
            options={[{ value: '1', label: f.georgianOnly }]}
            current={current.georgian}
            onSelect={selectFilter}
          />
        </div>
      </div>
    </aside>
  );
}
