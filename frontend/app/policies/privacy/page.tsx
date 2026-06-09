import type { Metadata } from 'next';
import { PolicyContent } from '@/components/policies/policy-content';
import { getServerDictionary } from '@/lib/i18n-server';
import { policyTranslations } from '@/lib/i18n-policies';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerDictionary();
  const policy = policyTranslations[locale].privacy;

  return {
    title: policy.title,
    alternates: { canonical: '/policies/privacy' }
  };
}

export default async function PrivacyPolicyPage() {
  const { locale } = await getServerDictionary();
  const policy = policyTranslations[locale].privacy;

  return <PolicyContent title={policy.title} blocks={policy.blocks} />;
}
