import type { Metadata } from 'next';
import { ProductCard } from '@/components/products/product-card';
import { ProductFilters } from '@/components/products/product-filters';
import { fetchCategories, fetchProducts } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Carpet Collection',
  description: 'Browse premium carpets with filtering by category and price.',
  alternates: {
    canonical: '/products'
  },
  openGraph: {
    title: 'Carpet Collection',
    description: 'Browse premium carpets with filtering by category and price.',
    url: 'http://localhost:3000/products'
  }
};

export const revalidate = 300;

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<{ search?: string; category?: string; minPrice?: string; maxPrice?: string }>;
}) {
  const params = await searchParams;
  const [categories, products] = await Promise.all([fetchCategories(), fetchProducts(params)]);

  return (
    <section className="oc-section">
      <div className="oc-container space-y-8">
        <header className="space-y-3">
          <p className="oc-subtitle">Catalog</p>
          <h1 className="oc-heading">Carpet Collection</h1>
          <p className="max-w-2xl text-sm leading-7 text-[var(--oc-muted)]">
            Search and filter carpets by category and price range.
          </p>
        </header>

        <ProductFilters categories={categories} current={params} />

        {products.items.length === 0 ? (
          <p className="oc-surface p-7 text-sm text-[var(--oc-muted)]">No products found for the current filters.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {products.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
