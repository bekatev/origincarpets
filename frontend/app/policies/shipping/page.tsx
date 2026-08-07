import type { Metadata } from 'next';
import { PolicyContent } from '@/components/policies/policy-content';
import { getServerDictionary } from '@/lib/i18n-server';
import { policyTranslations } from '@/lib/i18n-policies';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerDictionary();
  const policy = policyTranslations[locale].shipping;
  const description =
    locale === 'ka'
      ? 'Origin Carpets-ის მიწოდების პოლიტიკა — UPS, უფასო მიწოდება საქართველოში და სანდო გადაზიდვა.'
      : 'Origin Carpets shipping policy — UPS delivery, free shipping in Georgia, and trusted tracked freight.';

  return buildPageMetadata({
    title: policy.title,
    description,
    path: '/policies/shipping'
  });
}

export default async function ShippingPolicyPage() {
  const { locale } = await getServerDictionary();
  const policy = policyTranslations[locale].shipping;

  return (
    <PolicyContent title={policy.title} blocks={policy.blocks} />
  );
}
