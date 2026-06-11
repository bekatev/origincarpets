export type ProductLocale = 'en' | 'ka';

type LocalizedField = {
  en?: string | null;
  ka?: string | null;
  ge?: string | null;
  ru?: string | null;
};

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
    Runner: 'გრძელი'
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
    KILIM: 'ქილიმი',
    DJIDJIM: 'ჯიჯიმი',
    SUZANI: 'სუზანი',
    MAFRASH: 'მაფრაში',
    SADDLEBAG: 'ხელთათმანი'
  },
  age: {
    'Tribal handmade': 'ტრიბალური ხელნაკეთი',
    'Modern handmade': 'თანამედროვე ხელნაკეთი',
    'Antic handmade': 'ანტიკური ხელნაკეთი'
  }
};

export function pickLocalizedText(field: unknown, locale: ProductLocale, fallback = ''): string {
  if (locale === 'en') {
    if (typeof field === 'string') return field.trim() || fallback;
    if (field && typeof field === 'object') {
      const localized = field as LocalizedField;
      return localized.en?.trim() || fallback;
    }
    return fallback;
  }

  if (field && typeof field === 'object') {
    const localized = field as LocalizedField;
    const ka = localized.ka?.trim() || localized.ge?.trim();
    if (ka) return ka;
    return localized.en?.trim() || fallback;
  }

  if (typeof field === 'string') return field.trim() || fallback;
  return fallback;
}

export function translateAttributeValue(
  group: keyof typeof ATTRIBUTE_TRANSLATIONS,
  value: string | null | undefined,
  locale: ProductLocale
): string | null {
  if (!value) return null;
  if (locale === 'en') return value;
  return ATTRIBUTE_TRANSLATIONS[group]?.[value] ?? value;
}

export function readLocalizedFields(metadata: unknown): {
  title?: LocalizedField;
  description?: LocalizedField;
} {
  if (!metadata || typeof metadata !== 'object') return {};
  const record = metadata as Record<string, unknown>;
  return {
    title: record.title as LocalizedField | undefined,
    description: record.description as LocalizedField | undefined
  };
}
