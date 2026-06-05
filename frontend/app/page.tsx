import { HomePageContent } from '@/components/home/home-page-content';
import { fetchProducts } from '@/lib/products';

export const revalidate = 300;

export default async function HomePage() {
  const catalog = await fetchProducts({ limit: '5' });

  return <HomePageContent featured={catalog.items} />;
}
