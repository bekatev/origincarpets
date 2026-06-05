import { cookies } from 'next/headers';
import { dictionaries, LANG_COOKIE, normalizeLocale } from './i18n';

export async function getServerDictionary() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LANG_COOKIE)?.value);
  return { locale, dict: dictionaries[locale] };
}
