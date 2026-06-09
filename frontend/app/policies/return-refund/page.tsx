import type { Metadata } from 'next';
import { PolicyContent } from '@/components/policies/policy-content';
import { getServerDictionary } from '@/lib/i18n-server';
import { policyTranslations } from '@/lib/i18n-policies';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerDictionary();
  const policy = policyTranslations[locale].returnRefund;

  return {
    title: policy.title,
    alternates: { canonical: '/policies/return-refund' }
  };
}

export default async function ReturnRefundPolicyPage() {
  const { locale } = await getServerDictionary();
  const policy = policyTranslations[locale].returnRefund;

  return <PolicyContent title={policy.title} lastUpdated={policy.lastUpdated} blocks={policy.blocks} />;
}
