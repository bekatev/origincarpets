import { HomePageContent } from '@/components/home/home-page-content';
import { fetchProducts } from '@/lib/products';

export const revalidate = 60;

export default async function HomePage() {
  const catalog = await fetchProducts({ limit: '5' });

  return <HomePageContent featured={catalog.items} />;
}
