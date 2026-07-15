import type { Metadata } from 'next';
import { PolicyContent } from '@/components/policies/policy-content';
import { getServerDictionary } from '@/lib/i18n-server';
import { policyTranslations } from '@/lib/i18n-policies';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerDictionary();
  const policy = policyTranslations[locale].privacy;
  const description =
    locale === 'ka'
      ? 'Origin Carpets-ის კონფიდენციალურობის პოლიტიკა — როგორ ვამუშავებთ თქვენს მონაცემებს.'
      : 'Privacy policy for Origin Carpets — how we collect and use your data when you shop handmade carpets online.';

  return buildPageMetadata({
    title: policy.title,
    description,
    path: '/policies/privacy'
  });
}

export default async function PrivacyPolicyPage() {
  const { locale } = await getServerDictionary();
  const policy = policyTranslations[locale].privacy;

  return <PolicyContent title={policy.title} blocks={policy.blocks} />;
}
