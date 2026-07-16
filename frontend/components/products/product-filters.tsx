'use client';

import { useCallback, useState, useTransition } from 'react';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ProductFilterOptions, ProductListFilters } from '@/lib/products';
import { useI18n } from '@/components/providers/i18n-provider';
import { PriceRangeFilter } from '@/components/products/price-range-filter';
import { cn } from '@/lib/cn';

function splitValues(value?: string): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn('shrink-0 transition-transform duration-200', open && 'rotate-180')}
    >
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckboxOption({
  label,
  checked,
  onToggle
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5 py-1 text-sm">
      <input type="checkbox" checked={checked} onChange={onToggle} className="sr-only" />
      <span
        aria-hidden
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border transition',
          checked
            ? 'border-[var(--oc-ink)] bg-[var(--oc-ink)]'
            : 'border-[var(--oc-line)] bg-[var(--oc-paper)] group-hover:border-[var(--oc-ink)]'
        )}
      >
        {checked ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path
              d="m5 12 5 5 9-10"
              stroke="var(--oc-paper)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
      <span
        className={cn(
          'leading-5',
          checked ? 'font-medium text-[var(--oc-ink)]' : 'text-[var(--oc-muted)] group-hover:text-[var(--oc-ink)]'
        )}
      >
        {label}
      </span>
    </label>
  );
}

function FilterSection({
  title,
  selectedCount,
  open,
  onToggleOpen,
  children
}: {
  title: string;
  selectedCount?: number;
  open: boolean;
  onToggleOpen: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-[var(--oc-line)]">
      <button
        type="button"
        onClick={onToggleOpen}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 py-3 text-left"
      >
        <span className="oc-kicker flex items-center gap-2">
          {title}
          {selectedCount ? (
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--oc-ink)] px-1 text-[10px] font-semibold leading-none text-[var(--oc-paper)]">
              {selectedCount}
            </span>
          ) : null}
        </span>
        <ChevronIcon open={open} />
      </button>
      {open ? <div className="max-h-56 space-y-0.5 overflow-y-auto pb-3 pr-1">{children}</div> : null}
    </div>
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

  const toggleValue = useCallback(
    (name: string, value: string) => {
      const currentRaw = new URLSearchParams(searchParams.toString()).get(name) ?? '';
      const values = splitValues(currentRaw);
      const nextValues = values.includes(value)
        ? values.filter((entry) => entry !== value)
        : [...values, value];
      applyParam({ [name]: nextValues.join(',') });
    },
    [applyParam, searchParams]
  );

  const groups: Array<{
    name: keyof ProductListFilters & string;
    title: string;
    options: Array<{ value: string; label: string }>;
  }> = [
    {
      name: 'category',
      title: f.category,
      options: facets.categories.map((category) => ({ value: category.slug, label: category.name }))
    },
    { name: 'material', title: f.material, options: facets.materials.map((v) => ({ value: v, label: v })) },
    { name: 'size', title: f.size, options: facets.sizes.map((v) => ({ value: v, label: v })) },
    { name: 'origin', title: f.origin, options: facets.origins.map((v) => ({ value: v, label: v })) },
    { name: 'color', title: f.color, options: facets.colors.map((v) => ({ value: v, label: v })) },
    { name: 'age', title: f.age, options: facets.ages.map((v) => ({ value: v, label: v })) },
    { name: 'period', title: f.period, options: facets.periods.map((v) => ({ value: v, label: v })) },
    { name: 'georgian', title: f.georgian, options: [{ value: '1', label: f.georgianOnly }] }
  ];

  // Sections with an active selection start expanded.
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const group of groups) {
      initial[group.name] = splitValues(current[group.name]).length > 0;
    }
    return initial;
  });

  const toggleSection = (name: string) =>
    setOpenSections((prev) => ({ ...prev, [name]: !prev[name] }));

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

  return (
    <aside className="lg:sticky lg:top-24 lg:z-10 lg:self-start">
      <div className="oc-surface flex max-h-[min(38rem,calc(100dvh-6.5rem))] flex-col overflow-hidden lg:max-h-[calc(100dvh-7rem)]">
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
            'min-h-0 flex-1 overflow-y-auto px-4 py-3 transition-opacity sm:px-5',
            isPending && 'pointer-events-none opacity-60'
          )}
        >
          {facets.price && facets.price.buckets.length > 0 ? (
            <div className="pb-4">
              <PriceRangeFilter
                facet={facets.price}
                currentMin={current.minPrice}
                currentMax={current.maxPrice}
                label={f.price}
                onCommit={(minPrice, maxPrice) => applyParam({ minPrice, maxPrice })}
              />
            </div>
          ) : null}

          {groups.map((group) => {
            const selected = splitValues(current[group.name]);
            if (!group.options.length) return null;
            return (
              <FilterSection
                key={group.name}
                title={group.title}
                selectedCount={selected.length}
                open={Boolean(openSections[group.name])}
                onToggleOpen={() => toggleSection(group.name)}
              >
                {group.options.map((option) => (
                  <CheckboxOption
                    key={option.value}
                    label={option.label}
                    checked={selected.includes(option.value)}
                    onToggle={() => toggleValue(group.name, option.value)}
                  />
                ))}
              </FilterSection>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
