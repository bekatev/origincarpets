import type { Metadata } from 'next';
import { ProductsCatalogView } from '@/components/products/products-catalog-view';
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
  const [facets, products] = await Promise.all([fetchProductFilters(), fetchProducts(params)]);

  return <ProductsCatalogView facets={facets} products={products} params={params} />;
}
