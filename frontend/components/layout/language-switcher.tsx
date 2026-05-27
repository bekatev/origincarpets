'use client';

import { useI18n } from '@/components/providers/i18n-provider';

export function LanguageSwitcher() {
  const { locale, setLocale, dict } = useI18n();

  return (
    <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em]">
      <span className="text-[var(--oc-muted)]">{dict.common.language}</span>
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={`px-2 py-1 ${locale === 'en' ? 'text-[var(--oc-ink)]' : 'text-[var(--oc-muted)]'}`}
      >
        {dict.common.english}
      </button>
      <span className="text-[var(--oc-muted)]">/</span>
      <button
        type="button"
        onClick={() => setLocale('ka')}
        className={`px-2 py-1 ${locale === 'ka' ? 'text-[var(--oc-ink)]' : 'text-[var(--oc-muted)]'}`}
      >
        {dict.common.georgian}
      </button>
    </div>
  );
}
