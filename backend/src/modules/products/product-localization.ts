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
    KILIM: 'ფარდაგი',
    DJIDJIM: 'ჯეჯიმი',
    SUZANI: 'სუზანე',
    MAFRASH: 'მაფრაში',
    SADDLEBAG: 'ხურჯინი',
    SOUMAK: 'სუმახი'
  },
  age: {
    'Tribal handmade': 'ტრიბალური ხელნაქსოვი',
    'Modern handmade': 'თანამედროვე ხელნაქსოვი',
    'Antique handmade': 'ანტიკური ხელნაქსოვი',
    'Antic handmade': 'ანტიკური ხელნაქსოვი'
  }
};

const ORIGIN_PART_TRANSLATIONS: Record<string, string> = {
  Georgia: 'საქართველო',
  Azerbaijan: 'აზერბაიჯანი',
  Armenia: 'სომხეთი',
  Dagestan: 'დაღესტანი',
  Turkey: 'თურქეთი',
  Persia: 'სპარსეთი',
  Afghanistan: 'ავღანეთი',
  'Central Asia': 'ცენტრალური აზია',
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
  Arcekh: 'არცეხი',
  Chelaberd: 'ჩელაბერდი',
  Jeevan: 'ჯივანი',
  Karabakh: 'ყარაბაღი',
  Kazak: 'ყაზახი',
  Mugkhan: 'მუღანი',
  Shusha: 'შუშა',
  'Sevan Kazak': 'სევან ყაზახი',
  Chichi: 'ჩიჩი',
  Genje: 'განჯა',
  Kuba: 'ყუბა',
  Quba: 'ყუბა',
  Perebedil: 'პერებედილი',
  Shirvan: 'შირვანი',
  Zeikhur: 'ზეიხური',
  Derbend: 'დერბენტი',
  Zeiwa: 'ზეივა',
  Bakhtiari: 'ბახთიარი',
  Ispahan: 'ისპაჰანი',
  Kurdish: 'ქურთული',
  Sina: 'სინა',
  Tabriz: 'თავრიზი',
  Anatolian: 'ანატოლიური',
  Bessarabia: 'ბესარაბია',
  kayseri: 'კაისერი',
  Kayseri: 'კაისერი',
  Afghan: 'ავღანური',
  Turkmen: 'თურქმენული',
  Uzbekistan: 'უზბეკეთი',
  Yomut: 'იომუტი'
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

export function translateOriginValue(value: string | null | undefined, locale: ProductLocale): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (locale === 'en') return trimmed;

  return trimmed
    .split(/\s+-\s+/)
    .map((part) => ORIGIN_PART_TRANSLATIONS[part] ?? part)
    .join(' - ');
}

export function translateAgeOrPeriodValue(
  value: string | null | undefined,
  locale: ProductLocale
): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (locale === 'en') return trimmed;

  const ageTitle = ATTRIBUTE_TRANSLATIONS.age[trimmed];
  if (ageTitle) return ageTitle;

  if (/years?/i.test(trimmed)) {
    return trimmed.replace(/\s*years?/i, ' წელი').trim();
  }

  return trimmed;
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
