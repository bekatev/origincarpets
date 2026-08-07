import type { Locale } from '@/lib/i18n';
import type { ProductItem } from '@/lib/products';
import { toPlainText } from '@/lib/text';

type LocalizedField = {
  en?: string | null;
  ka?: string | null;
  ge?: string | null;
};

/** Georgian labels for catalog attribute values (exact English keys as stored). */
const ATTRIBUTE_TRANSLATIONS: Record<string, Record<string, string>> = {
  material: {
    Wool: 'მატყლი',
    Silk: 'აბრეშუმი',
    'Wool on cotton': 'მატყლი ბამბაზე',
    'Cotton And Silk': 'ბამბა და აბრეშუმი'
  },
  size: {
    Small: 'პატარა',
    Medium: 'საშუალო',
    Large: 'დიდი',
    'Extra large': 'ძალიან დიდი',
    Runner: 'გრძელი',
    Circle: 'წრიული'
  },
  color: {
    Blue: 'ლურჯი',
    Brown: 'ყავისფერი',
    Dark: 'მუქი',
    Green: 'მწვანე',
    Light: 'ღია',
    Mixed: 'შერეული',
    Orange: 'ნარინჯისფერი',
    'Pastel colours': 'პასტელური ფერები',
    Pink: 'ვარდისფერი',
    Purple: 'იისფერი',
    Red: 'წითელი',
    'Red/Blue': 'წითელი/ლურჯი'
  },
  category: {
    CARPET: 'ხალიჩა',
    Carpet: 'ხალიჩა',
    KILIM: 'ფარდაგი',
    Kilim: 'ფარდაგი',
    SOUMAK: 'სუმახი',
    Soumak: 'სუმახი',
    ZILI: 'ზილი',
    Zili: 'ზილი',
    DJIDJIM: 'ჯეჯიმი',
    Djidjim: 'ჯეჯიმი',
    DECORATION: 'დეკორაცია',
    Decoration: 'დეკორაცია',
    // Legacy categories (merged into Decoration)
    SUZANI: 'სუზანე',
    Suzani: 'სუზანე',
    MAFRASH: 'დეკორაცია',
    Mafrash: 'დეკორაცია',
    SADDLEBAG: 'დეკორაცია',
    Saddlebag: 'დეკორაცია',
    SALE: 'აქცია'
  },
  age: {
    'Tribal handmade': 'ტრიბალური ხელნაქსოვი',
    'Modern handmade': 'თანამედროვე ხელნაქსოვი',
    'Antique handmade': 'ანტიკური ხელნაქსოვი',
    // Legacy typo from older imports / UI copy
    'Antic handmade': 'ანტიკური ხელნაქსოვი'
  }
};

/** Country and region name parts used in `origin` ("Country - Region"). */
const ORIGIN_PART_TRANSLATIONS: Record<string, string> = {
  // Countries
  Georgia: 'საქართველო',
  Azerbaijan: 'აზერბაიჯანი',
  Armenia: 'სომხეთი',
  Dagestan: 'დაღესტანი',
  Turkey: 'თურქეთი',
  Persia: 'სპარსეთი',
  Afghanistan: 'ავღანეთი',
  'Central Asia': 'ცენტრალური აზია',

  // Georgia
  Akhaltsikhe: 'ახალციხე',
  Borchalo: 'ბორჩალო',
  'Borchalo Marneuli': 'ბორჩალო მარნეული',
  Kakheti: 'კახეთი',
  Khevsureti: 'ხევსურეთი',
  Marneuli: 'მარნეული',
  Meskheti: 'მესხეთი',
  Pshavi: 'ფშავი',
  Shatili: 'შატილი',
  Tusheti: 'თუშეთი',

  // Armenia / Caucasus
  Arcekh: 'არცეხი',
  Chelaberd: 'ჩელაბერდი',
  Jeevan: 'ჯივანი',
  Karabakh: 'ყარაბაღი',
  Kazak: 'ყაზახი',
  Mugkhan: 'მუღანი',
  Shusha: 'შუშა',
  'Sevan Kazak': 'სევან ყაზახი',

  // Azerbaijan
  Chichi: 'ჩიჩი',
  Genje: 'განჯა',
  Kuba: 'ყუბა',
  Quba: 'ყუბა',
  Perebedil: 'პერებედილი',
  Shirvan: 'შირვანი',
  Zeikhur: 'ზეიხური',

  // Dagestan
  Derbend: 'დერბენტი',
  Zeiwa: 'ზეივა',

  // Persia / Iran
  Bakhtiari: 'ბახთიარი',
  Ispahan: 'ისპაჰანი',
  Kurdish: 'ქურთული',
  Sina: 'სინა',
  Tabriz: 'თავრიზი',

  // Turkey
  Anatolian: 'ანატოლიური',
  Bessarabia: 'ბესარაბია',
  kayseri: 'კაისერი',
  Kayseri: 'კაისერი',

  // Central Asia / Afghanistan
  Afghan: 'ავღანური',
  Turkmen: 'თურქმენული',
  Uzbekistan: 'უზბეკეთი',
  Yomut: 'იომუტი'
};

function pickLocalizedText(field: LocalizedField | string | null | undefined, locale: Locale, fallback: string): string {
  if (locale === 'en') {
    if (typeof field === 'string') return field.trim() || fallback;
    if (field && typeof field === 'object') return field.en?.trim() || fallback;
    return fallback;
  }

  if (field && typeof field === 'object') {
    const ka = field.ka?.trim() || field.ge?.trim();
    if (ka) return ka;
    return field.en?.trim() || fallback;
  }

  if (typeof field === 'string') return field.trim() || fallback;
  return fallback;
}

function translateAttributeValue(
  group: keyof typeof ATTRIBUTE_TRANSLATIONS,
  value: string | null | undefined,
  locale: Locale
): string | null {
  if (!value) return null;

  const categoryKey = value.trim().toUpperCase().replace(/\s+/g, '');
  if (group === 'category' && (categoryKey === 'MAFRASH' || categoryKey === 'SADDLEBAG' || categoryKey === 'DECORATION')) {
    return locale === 'ka' ? 'დეკორაცია' : 'Decoration';
  }

  if (locale === 'en') return value;
  return ATTRIBUTE_TRANSLATIONS[group]?.[value] ?? value;
}

/** Translate origin strings such as "Georgia - Tusheti" or bare country names. */
export function translateOriginValue(value: string | null | undefined, locale: Locale): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (locale === 'en') return trimmed;

  return trimmed
    .split(/\s+-\s+/)
    .map((part) => ORIGIN_PART_TRANSLATIONS[part] ?? ORIGIN_PART_TRANSLATIONS[part.trim()] ?? part)
    .join(' - ');
}

/** Translate age titles and period labels (e.g. "1-2 Years"). */
export function translateAgeOrPeriodValue(value: string | null | undefined, locale: Locale): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (locale === 'en') return trimmed;

  const ageTitle = ATTRIBUTE_TRANSLATIONS.age[trimmed];
  if (ageTitle) return ageTitle;

  // "1-2 Years" → "1-2 წელი"
  if (/years?/i.test(trimmed)) {
    return trimmed.replace(/\s*years?/i, ' წელი').trim();
  }

  return trimmed;
}

export function localizeProduct(product: ProductItem, locale: Locale): ProductItem {
  const titleField = product.localizations?.title ?? { en: product.title };
  const descriptionField = product.localizations?.description ?? { en: product.description };

  return {
    ...product,
    title: pickLocalizedText(titleField, locale, product.title),
    description: pickLocalizedText(descriptionField, locale, product.description),
    origin: translateOriginValue(product.origin, locale),
    category: {
      ...product.category,
      name: translateAttributeValue('category', product.category.name, locale) ?? product.category.name
    },
    attributes: {
      ...product.attributes,
      size: translateAttributeValue('size', product.attributes.size, locale),
      color: translateAttributeValue('color', product.attributes.color, locale),
      material: translateAttributeValue('material', product.attributes.material, locale),
      age: translateAgeOrPeriodValue(product.attributes.age ?? null, locale),
      period: translateAgeOrPeriodValue(product.attributes.period ?? null, locale)
    }
  };
}

export function localizedPlainDescription(product: ProductItem, locale: Locale): string {
  return toPlainText(localizeProduct(product, locale).description);
}

export function translateFacetLabel(
  kind: 'material' | 'size' | 'color' | 'origin' | 'age' | 'period' | 'category',
  value: string,
  locale: Locale
): string {
  if (kind === 'origin') return translateOriginValue(value, locale) ?? value;
  if (kind === 'age' || kind === 'period') return translateAgeOrPeriodValue(value, locale) ?? value;
  if (kind === 'category') return translateAttributeValue('category', value, locale) ?? value;
  return translateAttributeValue(kind, value, locale) ?? value;
}
