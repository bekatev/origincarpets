import type { Metadata } from 'next';
import { ProductCard } from '@/components/products/product-card';
import { ProductFilters } from '@/components/products/product-filters';
import { fetchCategories, fetchProducts } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Carpet Products',
  description: 'Browse premium carpets with filtering by category and price.'
};

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<{ search?: string; category?: string; minPrice?: string; maxPrice?: string }>;
}) {
  const params = await searchParams;
  const [categories, products] = await Promise.all([fetchCategories(), fetchProducts(params)]);

  return (
    <section className="mx-auto max-w-6xl space-y-6 p-8">
      <header>
        <h1 className="text-3xl font-semibold">Carpet Catalog</h1>
        <p className="mt-2 text-stone-700">Search and filter carpets by category and price range.</p>
      </header>

      <ProductFilters categories={categories} current={params} />

      {products.items.length === 0 ? (
        <p className="rounded-md border border-stone-200 bg-white p-6 text-stone-600">No products found for the current filters.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
