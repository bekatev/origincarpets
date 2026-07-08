/** ISO countries for UPS checkout. `gpostId` is a legacy unique numeric id column (ISO code). */
export const UPS_DELIVERY_COUNTRIES = [
  { abbr: 'GE', nameEn: 'Georgia', nameGe: 'საქართველო', gpostId: 268 },
  { abbr: 'US', nameEn: 'United States', nameGe: 'აშშ', gpostId: 840 },
  { abbr: 'CA', nameEn: 'Canada', nameGe: 'კანადა', gpostId: 124 },
  { abbr: 'GB', nameEn: 'United Kingdom', nameGe: 'გაერთიანებული სამეფო', gpostId: 826 },
  { abbr: 'DE', nameEn: 'Germany', nameGe: 'გერმანია', gpostId: 276 },
  { abbr: 'FR', nameEn: 'France', nameGe: 'საფრანგეთი', gpostId: 250 },
  { abbr: 'IT', nameEn: 'Italy', nameGe: 'იტალია', gpostId: 380 },
  { abbr: 'ES', nameEn: 'Spain', nameGe: 'ესპანეთი', gpostId: 724 },
  { abbr: 'NL', nameEn: 'Netherlands', nameGe: 'ნიდერლანდები', gpostId: 528 },
  { abbr: 'BE', nameEn: 'Belgium', nameGe: 'ბელგია', gpostId: 56 },
  { abbr: 'AT', nameEn: 'Austria', nameGe: 'ავსტრია', gpostId: 40 },
  { abbr: 'CH', nameEn: 'Switzerland', nameGe: 'შვეიცარია', gpostId: 756 },
  { abbr: 'SE', nameEn: 'Sweden', nameGe: 'შვედეთი', gpostId: 752 },
  { abbr: 'NO', nameEn: 'Norway', nameGe: 'ნორვეგია', gpostId: 578 },
  { abbr: 'DK', nameEn: 'Denmark', nameGe: 'დანია', gpostId: 208 },
  { abbr: 'FI', nameEn: 'Finland', nameGe: 'ფინეთი', gpostId: 246 },
  { abbr: 'PL', nameEn: 'Poland', nameGe: 'პოლონეთი', gpostId: 616 },
  { abbr: 'CZ', nameEn: 'Czechia', nameGe: 'ჩეხეთი', gpostId: 203 },
  { abbr: 'GR', nameEn: 'Greece', nameGe: 'საბერძნეთი', gpostId: 300 },
  { abbr: 'PT', nameEn: 'Portugal', nameGe: 'პორტუგალია', gpostId: 620 },
  { abbr: 'IE', nameEn: 'Ireland', nameGe: 'ირლანდია', gpostId: 372 },
  { abbr: 'AE', nameEn: 'United Arab Emirates', nameGe: 'არაბთა გაერთიანებული საამიროები', gpostId: 784 },
  { abbr: 'SA', nameEn: 'Saudi Arabia', nameGe: 'საუდის არაბეთი', gpostId: 682 },
  { abbr: 'QA', nameEn: 'Qatar', nameGe: 'კატარი', gpostId: 634 },
  { abbr: 'TR', nameEn: 'Turkey', nameGe: 'თურქეთი', gpostId: 792 },
  { abbr: 'IL', nameEn: 'Israel', nameGe: 'ისრაელი', gpostId: 376 },
  { abbr: 'AU', nameEn: 'Australia', nameGe: 'ავსტრალია', gpostId: 36 },
  { abbr: 'NZ', nameEn: 'New Zealand', nameGe: 'ახალი ზელანდია', gpostId: 554 },
  { abbr: 'JP', nameEn: 'Japan', nameGe: 'იაპონია', gpostId: 392 },
  { abbr: 'KR', nameEn: 'South Korea', nameGe: 'სამხრეთ კორეა', gpostId: 410 },
  { abbr: 'CN', nameEn: 'China', nameGe: 'ჩინეთი', gpostId: 156 },
  { abbr: 'HK', nameEn: 'Hong Kong', nameGe: 'ჰონგ კონგი', gpostId: 344 },
  { abbr: 'SG', nameEn: 'Singapore', nameGe: 'სინგაპური', gpostId: 702 },
  { abbr: 'IN', nameEn: 'India', nameGe: 'ინდოეთი', gpostId: 356 },
  { abbr: 'RU', nameEn: 'Russia', nameGe: 'რუსეთი', gpostId: 643 },
  { abbr: 'UA', nameEn: 'Ukraine', nameGe: 'უკრაინა', gpostId: 804 },
  { abbr: 'KZ', nameEn: 'Kazakhstan', nameGe: 'ყაზახეთი', gpostId: 398 },
  { abbr: 'AZ', nameEn: 'Azerbaijan', nameGe: 'აზერბაიჯანი', gpostId: 31 },
  { abbr: 'AM', nameEn: 'Armenia', nameGe: 'სომხეთი', gpostId: 51 }
] as const;

/**
 * Placeholder city for international addresses — customer types the city in the
 * address fields. `gpostId` must be globally unique, so we offset each country's
 * gpostId into a reserved band (>= UPS_INTERNATIONAL_CITY_GPOST_BASE).
 */
export const UPS_INTERNATIONAL_CITY_GPOST_BASE = 9_000_000;

export const UPS_INTERNATIONAL_CITY = {
  nameEn: 'Other (enter city below)',
  nameGe: 'სხვა (ქალაქი მიუთითეთ ქვემოთ)'
} as const;

export function internationalCityGpostId(countryGpostId: number) {
  return UPS_INTERNATIONAL_CITY_GPOST_BASE + countryGpostId;
}
