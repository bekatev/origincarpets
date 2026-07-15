import type { Metadata } from 'next';
import { ProductsCatalogView } from '@/components/products/products-catalog-view';
import { JsonLd } from '@/components/seo/json-ld';
import { getServerDictionary } from '@/lib/i18n-server';
import { fetchProductFilters, fetchProducts, type ProductListFilters } from '@/lib/products';
import {
  SITE_DESCRIPTION_EN,
  SITE_DESCRIPTION_KA,
  breadcrumbJsonLd,
  buildPageMetadata,
  itemListJsonLd
} from '@/lib/seo';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getServerDictionary();
  const title = dict.products.title;

  return buildPageMetadata({
    title,
    description:
      locale === 'ka'
        ? 'დაათვალიერეთ ხელნაკეთი კავკასიური და აღმოსავლური ხალიჩები — ფილტრი კატეგორიის, მასალის, წარმოშობისა და ზომის მიხედვით.'
        : dict.products.intro ||
          'Browse handmade Caucasian and Oriental carpets and kilims. Filter by category, material, origin, size, and more. Worldwide UPS delivery from Tbilisi.',
    path: '/products'
  });
}

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<ProductListFilters>;
}) {
  const params = await searchParams;
  const { locale, dict } = await getServerDictionary();
  const [facets, products] = await Promise.all([fetchProductFilters(), fetchProducts(params)]);
  const description = locale === 'ka' ? SITE_DESCRIPTION_KA : SITE_DESCRIPTION_EN;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: dict.products.title, path: '/products' }
          ]),
          itemListJsonLd({
            name: dict.products.title,
            description,
            path: '/products',
            items: products.items.slice(0, 40).map((item) => ({
              name: item.title,
              slug: item.slug,
              image: item.images[0]
            }))
          })
        ]}
      />
      <ProductsCatalogView facets={facets} products={products} params={params} />
    </>
  );
}
