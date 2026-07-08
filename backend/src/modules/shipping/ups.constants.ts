export type UpsDeliveryMethodKey = 'UPS_WORLDWIDE';

export type UpsDeliveryMethod = {
  value: UpsDeliveryMethodKey;
  label: { en: string; ge: string };
  descTop: { en: string; ge: string };
  descBottom: { en: string; ge: string };
  minDeliveryDays: number;
  maxDeliveryDays: number;
};

export const UPS_WORLDWIDE_METHOD: UpsDeliveryMethod = {
  value: 'UPS_WORLDWIDE',
  label: { en: 'UPS Worldwide', ge: 'UPS მსოფლიო მიწოდება' },
  descTop: {
    en: 'Delivery via UPS from our Tbilisi gallery',
    ge: 'მიწოდება UPS-ით ჩვენი თბილისის გალერეიდან'
  },
  descBottom: {
    en: 'Typically 3–10 business days',
    ge: 'ჩვეულებრივ 3–10 სამუშაო დღე'
  },
  minDeliveryDays: 3,
  maxDeliveryDays: 10
};

export const UPS_DOMESTIC_METHOD: UpsDeliveryMethod = {
  value: 'UPS_WORLDWIDE',
  label: { en: 'Domestic delivery', ge: 'შიდა მიწოდება' },
  descTop: {
    en: 'UPS delivery within Georgia',
    ge: 'UPS მიწოდება საქართველოს ფარგლებში'
  },
  descBottom: {
    en: 'Free delivery · 2–4 business days',
    ge: 'უფასო მიწოდება · 2–4 სამუშაო დღე'
  },
  minDeliveryDays: 2,
  maxDeliveryDays: 4
};

export const UPS_DELIVERY_METHODS: Record<UpsDeliveryMethodKey, UpsDeliveryMethod> = {
  UPS_WORLDWIDE: UPS_WORLDWIDE_METHOD
};

export const UPS_DELIVERY_METHOD_KEYS = Object.keys(UPS_DELIVERY_METHODS) as UpsDeliveryMethodKey[];
