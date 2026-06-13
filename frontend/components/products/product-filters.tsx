'use client';

import Link from 'next/link';
import type { ProductFilterOptions, ProductListFilters } from '@/lib/products';
import { useI18n } from '@/components/providers/i18n-provider';

function FilterSelect({
  label,
  name,
  value,
  options,
  placeholder
}: {
  label: string;
  name: string;
  value?: string;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="oc-kicker block">
        {label}
      </label>
      <select id={name} name={name} defaultValue={value ?? ''} className="oc-input py-2 text-sm">
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
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

  const hasActiveFilters = Boolean(
    current.search ||
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
      <form
        className="oc-surface flex max-h-[min(32rem,calc(100dvh-6.5rem))] flex-col overflow-hidden lg:max-h-[calc(100dvh-7rem)]"
        method="get"
      >
        <div className="space-y-1 border-b border-[var(--oc-line)] px-4 py-3 sm:px-5">
          <h2 className="font-display text-base font-medium uppercase tracking-[0.1em]">{f.title}</h2>
          <p className="text-[11px] leading-4 text-[var(--oc-muted)]">{f.subtitle}</p>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3 sm:px-5">
          <div className="space-y-1">
            <label htmlFor="search" className="oc-kicker block">
              {f.search}
            </label>
            <input
              id="search"
              name="search"
              defaultValue={current.search}
              placeholder={f.searchPlaceholder}
              className="oc-input py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="category" className="oc-kicker block">
              {f.category}
            </label>
            <select id="category" name="category" defaultValue={current.category ?? ''} className="oc-input py-2 text-sm">
              <option value="">{f.allCategories}</option>
              {facets.categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FilterSelect label={f.material} name="material" value={current.material} options={facets.materials} placeholder={f.allMaterials} />
            <FilterSelect label={f.size} name="size" value={current.size} options={facets.sizes} placeholder={f.allSizes} />
            <FilterSelect label={f.origin} name="origin" value={current.origin} options={facets.origins} placeholder={f.allOrigins} />
            <FilterSelect label={f.color} name="color" value={current.color} options={facets.colors} placeholder={f.allColors} />
            <FilterSelect label={f.age} name="age" value={current.age} options={facets.ages} placeholder={f.allAges} />
            <FilterSelect label={f.period} name="period" value={current.period} options={facets.periods} placeholder={f.allPeriods} />
          </div>

          <div className="space-y-1">
            <label htmlFor="georgian" className="oc-kicker block">
              {f.georgian}
            </label>
            <select id="georgian" name="georgian" defaultValue={current.georgian ?? ''} className="oc-input py-2 text-sm">
              <option value="">{f.allCarpets}</option>
              <option value="1">{f.georgianOnly}</option>
            </select>
          </div>

          <div className="space-y-1">
            <p className="oc-kicker">{f.price}</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min={0}
                name="minPrice"
                defaultValue={current.minPrice}
                placeholder={f.minPrice}
                className="oc-input py-2 text-sm"
                aria-label={f.minPrice}
              />
              <input
                type="number"
                min={0}
                name="maxPrice"
                defaultValue={current.maxPrice}
                placeholder={f.maxPrice}
                className="oc-input py-2 text-sm"
                aria-label={f.maxPrice}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-[var(--oc-line)] bg-[var(--oc-paper)] px-4 py-3 sm:px-5">
          <button type="submit" className="oc-btn-primary w-full py-2 text-sm">
            {f.apply}
          </button>
          {hasActiveFilters && (
            <Link href="/products" className="oc-btn-secondary w-full py-2 text-center text-sm">
              {f.clear}
            </Link>
          )}
        </div>
      </form>
    </aside>
  );
}
