export type UpsDeliveryMethodKey = 'UPS_STANDARD' | 'UPS_EXPRESS';

export type UpsDeliveryMethod = {
  value: UpsDeliveryMethodKey;
  label: { en: string; ge: string };
  descTop: { en: string; ge: string };
  descBottom: { en: string; ge: string };
  minDeliveryDays: number;
  maxDeliveryDays: number;
};

export const UPS_DELIVERY_METHODS: Record<UpsDeliveryMethodKey, UpsDeliveryMethod> = {
  UPS_STANDARD: {
    value: 'UPS_STANDARD',
    label: { en: 'UPS Standard', ge: 'UPS სტანდარტული' },
    descTop: {
      en: 'Economy delivery via UPS',
      ge: 'ეკონომ გადაზიდვა UPS-ით'
    },
    descBottom: {
      en: 'Typically 5–10 business days (international)',
      ge: 'სავარაუდოდ 5–10 სამუშაო დღე (საერთაშორისო)'
    },
    minDeliveryDays: 3,
    maxDeliveryDays: 10
  },
  UPS_EXPRESS: {
    value: 'UPS_EXPRESS',
    label: { en: 'UPS Express', ge: 'UPS ექსპრესი' },
    descTop: {
      en: 'Priority delivery via UPS',
      ge: 'პრიორიტეტული მიწოდება UPS-ით'
    },
    descBottom: {
      en: 'Typically 2–5 business days (international)',
      ge: 'სავარაუდოდ 2–5 სამუშაო დღე (საერთაშორისო)'
    },
    minDeliveryDays: 1,
    maxDeliveryDays: 5
  }
};

export const UPS_DOMESTIC_METHOD: UpsDeliveryMethod = {
  value: 'UPS_STANDARD',
  label: { en: 'Domestic delivery', ge: 'შიდა მიწოდება' },
  descTop: {
    en: 'UPS delivery within Georgia',
    ge: 'UPS მიწოდება საქართველოს ფარგლებში'
  },
  descBottom: {
    en: 'Typically 2–4 business days',
    ge: 'სავარაუდოდ 2–4 სამუშაო დღე'
  },
  minDeliveryDays: 2,
  maxDeliveryDays: 4
};

export const UPS_DELIVERY_METHOD_KEYS = Object.keys(UPS_DELIVERY_METHODS) as UpsDeliveryMethodKey[];
