import type { Locale } from '@/lib/i18n';
import type { ProductItem } from '@/lib/products';
import { toPlainText } from '@/lib/text';

type LocalizedField = {
  en?: string | null;
  ka?: string | null;
  ge?: string | null;
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
  if (locale === 'en') return value;
  return ATTRIBUTE_TRANSLATIONS[group]?.[value] ?? value;
}

export function localizeProduct(product: ProductItem, locale: Locale): ProductItem {
  const titleField = product.localizations?.title ?? { en: product.title };
  const descriptionField = product.localizations?.description ?? { en: product.description };

  return {
    ...product,
    title: pickLocalizedText(titleField, locale, product.title),
    description: pickLocalizedText(descriptionField, locale, product.description),
    category: {
      ...product.category,
      name: translateAttributeValue('category', product.category.name, locale) ?? product.category.name
    },
    attributes: {
      ...product.attributes,
      size: translateAttributeValue('size', product.attributes.size, locale),
      color: translateAttributeValue('color', product.attributes.color, locale),
      material: translateAttributeValue('material', product.attributes.material, locale),
      age: translateAttributeValue('age', product.attributes.age ?? null, locale)
    }
  };
}

export function localizedPlainDescription(product: ProductItem, locale: Locale): string {
  return toPlainText(localizeProduct(product, locale).description);
}
