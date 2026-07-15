import type { Metadata } from 'next';
import { PolicyContent } from '@/components/policies/policy-content';
import { getServerDictionary } from '@/lib/i18n-server';
import { policyTranslations } from '@/lib/i18n-policies';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerDictionary();
  const policy = policyTranslations[locale].returnRefund;
  const description =
    locale === 'ka'
      ? 'Origin Carpets-ის დაბრუნებისა და თანხის დაბრუნების პოლიტიკა.'
      : 'Return and refund policy for Origin Carpets handmade carpet purchases.';

  return buildPageMetadata({
    title: policy.title,
    description,
    path: '/policies/return-refund'
  });
}

export default async function ReturnRefundPolicyPage() {
  const { locale } = await getServerDictionary();
  const policy = policyTranslations[locale].returnRefund;

  return <PolicyContent title={policy.title} lastUpdated={policy.lastUpdated} blocks={policy.blocks} />;
}
