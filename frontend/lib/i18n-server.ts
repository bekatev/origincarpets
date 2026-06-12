import { cookies } from 'next/headers';
import { dictionaries, LANG_COOKIE, resolveSiteLocale } from './i18n';

export async function getServerDictionary() {
  const cookieStore = await cookies();
  const locale = resolveSiteLocale(cookieStore.get(LANG_COOKIE)?.value);
  return { locale, dict: dictionaries[locale] };
}
