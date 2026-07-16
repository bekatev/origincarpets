'use client';

import { useEffect, useState } from 'react';
import { ProductCard, type ProductCardVariant } from '@/components/products/product-card';
import { ProductFilters } from '@/components/products/product-filters';
import { useI18n } from '@/components/providers/i18n-provider';
import { formatCount } from '@/lib/i18n';
import { cn } from '@/lib/cn';
import type { ProductFilterOptions, ProductItem, ProductListFilters } from '@/lib/products';

const VIEW_STORAGE_KEY = 'oc-products-view';

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8 6h13M8 12h13M8 18h13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="3" y="5" width="2.5" height="2.5" fill="currentColor" />
      <rect x="3" y="11" width="2.5" height="2.5" fill="currentColor" />
      <rect x="3" y="17" width="2.5" height="2.5" fill="currentColor" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Filter params re-submitted as hidden inputs so searching keeps active filters. */
const SEARCH_PRESERVED_PARAMS = [
  'category',
  'material',
  'size',
  'origin',
  'color',
  'period',
  'age',
  'georgian',
  'minPrice',
  'maxPrice'
] as const;

export function ProductsCatalogView({
  facets,
  products,
  params
}: {
  facets: ProductFilterOptions;
  products: { items: ProductItem[]; meta: { total: number } };
  params: ProductListFilters;
}) {
  const { dict } = useI18n();
  const p = dict.products;
  const f = dict.filters;
  const [view, setView] = useState<ProductCardVariant>('grid');

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
      if (stored === 'list' || stored === 'grid') {
        setView(stored);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setViewMode = (next: ProductCardVariant) => {
    setView(next);
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  const countLabel =
    products.meta.total === 1
      ? formatCount(p.countOne, products.meta.total)
      : formatCount(p.countMany, products.meta.total);

  return (
    <section className="oc-section">
      <div className="oc-container space-y-14">
        <div className="oc-container-narrow space-y-4 text-center">
          <p className="oc-eyebrow">{p.catalog}</p>
          <h1 className="oc-heading">{p.title}</h1>
          <p className="oc-lead mx-auto max-w-2xl">
            {countLabel} — {p.intro}
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(240px,280px)_1fr] lg:gap-12">
          <ProductFilters facets={facets} current={params} />

          <div className="min-w-0 space-y-5">
            <form method="get" className="flex gap-2" role="search">
              {SEARCH_PRESERVED_PARAMS.map((name) => {
                const value = params[name];
                return value ? <input key={name} type="hidden" name={name} value={value} /> : null;
              })}
              <input
                id="search"
                name="search"
                type="search"
                defaultValue={params.search}
                placeholder={f.searchPlaceholder}
                aria-label={f.search}
                className="oc-input flex-1 py-2 text-sm"
              />
              <button type="submit" className="oc-btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm">
                <SearchIcon />
                {f.search}
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--oc-line)] pb-4">
              <p className="text-sm text-[var(--oc-muted)]">{countLabel}</p>
              <div
                className="inline-flex items-center gap-1 rounded-sm border border-[var(--oc-line)] p-0.5"
                role="group"
                aria-label={p.viewLabel}
              >
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  aria-pressed={view === 'list'}
                  aria-label={p.viewList}
                  title={p.viewList}
                  className={cn(
                    'inline-flex h-9 w-9 items-center justify-center rounded-[2px] transition',
                    view === 'list'
                      ? 'bg-[var(--oc-ink)] text-[var(--oc-paper)]'
                      : 'text-[var(--oc-muted)] hover:text-[var(--oc-ink)]'
                  )}
                >
                  <ListIcon />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-pressed={view === 'grid'}
                  aria-label={p.viewGrid}
                  title={p.viewGrid}
                  className={cn(
                    'inline-flex h-9 w-9 items-center justify-center rounded-[2px] transition',
                    view === 'grid'
                      ? 'bg-[var(--oc-ink)] text-[var(--oc-paper)]'
                      : 'text-[var(--oc-muted)] hover:text-[var(--oc-ink)]'
                  )}
                >
                  <GridIcon />
                </button>
              </div>
            </div>

            {products.items.length === 0 ? (
              <p className="py-12 text-center text-sm text-[var(--oc-muted)]">{p.noResults}</p>
            ) : view === 'list' ? (
              <div className="flex flex-col gap-4">
                {products.items.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priority={index < 4}
                    variant="list"
                  />
                ))}
              </div>
            ) : (
              <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                {products.items.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priority={index < 6}
                    variant="grid"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
