import type { Metadata } from 'next';
import { MotionSection } from '@/components/motion/section';
import { Reveal } from '@/components/motion/reveal';
import { ProductCard } from '@/components/products/product-card';
import { ProductFilters } from '@/components/products/product-filters';
import { formatCount } from '@/lib/i18n';
import { getServerDictionary } from '@/lib/i18n-server';
import { fetchProductFilters, fetchProducts, type ProductListFilters } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Carpet Collection',
  description: 'Browse premium carpets with filtering by category, material, origin, and more.',
  alternates: {
    canonical: '/products'
  },
  openGraph: {
    title: 'Carpet Collection',
    description: 'Browse premium carpets with filtering by category, material, origin, and more.',
    url: 'http://localhost:3000/products'
  }
};

export const revalidate = 300;

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<ProductListFilters>;
}) {
  const params = await searchParams;
  const [{ dict }, facets, products] = await Promise.all([
    getServerDictionary(),
    fetchProductFilters(),
    fetchProducts(params)
  ]);
  const p = dict.products;
  const countLabel =
    products.meta.total === 1
      ? formatCount(p.countOne, products.meta.total)
      : formatCount(p.countMany, products.meta.total);

  return (
    <MotionSection className="oc-section">
      <div className="oc-container space-y-14">
        <Reveal className="oc-container-narrow space-y-4 text-center">
          <p className="oc-eyebrow">{p.catalog}</p>
          <h1 className="oc-heading">{p.title}</h1>
          <p className="oc-lead mx-auto max-w-2xl">
            {countLabel} — {p.intro}
          </p>
        </Reveal>

        <div className="grid gap-12 lg:grid-cols-[minmax(240px,280px)_1fr] lg:gap-16">
          <ProductFilters facets={facets} current={params} />

          <div className="min-w-0 space-y-6">
            {products.items.length === 0 ? (
              <p className="py-12 text-center text-sm text-[var(--oc-muted)]">{p.noResults}</p>
            ) : (
              <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                {products.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MotionSection>
  );
}
