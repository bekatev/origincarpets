export type GpostDeliveryMethodKey = 'AVIA' | 'EMS' | 'CD-Parcel';

export type GpostDeliveryMethod = {
  gpostId: number;
  value: GpostDeliveryMethodKey;
  label: { en: string; ge: string };
  descTop: { en: string; ge: string };
  descBottom: { en: string; ge: string };
  supportsLocal?: boolean;
  minDeliveryDays: number;
  maxDeliveryDays: number;
};

export const GPOST_DELIVERY_METHODS: Record<GpostDeliveryMethodKey, GpostDeliveryMethod> = {
  AVIA: {
    gpostId: 69,
    value: 'AVIA',
    label: { en: 'AVIA', ge: 'A გზავნილი - AVIA' },
    descTop: { en: 'AVIA Mail Service', ge: 'AVIA Mail Service' },
    descBottom: { en: 'Delivery period up to 10 working days', ge: 'Delivery period up to 10 working days' },
    minDeliveryDays: 5,
    maxDeliveryDays: 10
  },
  EMS: {
    gpostId: 55,
    value: 'EMS',
    label: { en: 'EMS', ge: 'E გზავნილი - EMS' },
    descTop: { en: 'Express Mail Service', ge: 'Express Mail Service' },
    descBottom: { en: 'Delivery period up to 14 working days', ge: 'Delivery period up to 14 working days' },
    minDeliveryDays: 7,
    maxDeliveryDays: 14
  },
  'CD-Parcel': {
    gpostId: 39,
    value: 'CD-Parcel',
    label: { en: 'Worldwide & Domestic', ge: 'საერთაშორისო & შიდა' },
    descTop: { en: 'Worldwide & Domestic Mail Service', ge: 'საერთაშორისო & შიდა გზავნილი' },
    descBottom: { en: 'Delivery period 7–21 working days', ge: 'გზავნილის მიტანის დრო 7–21 დღე' },
    supportsLocal: true,
    minDeliveryDays: 7,
    maxDeliveryDays: 21
  }
};

export const GPOST_METHODS_BY_ID: Record<string, GpostDeliveryMethod> = {
  '69': GPOST_DELIVERY_METHODS.AVIA,
  '55': GPOST_DELIVERY_METHODS.EMS,
  '39': GPOST_DELIVERY_METHODS['CD-Parcel']
};

export const GPOST_RECEIVER_TYPES = {
  INDIVIDUAL: 2,
  ORGANIZATION: 1
} as const;

export const GPOST_PAYMENT_METHODS = {
  SENDER_PAYS: 230,
  RECEIVER_PAYS: 231
} as const;

export const GPOST_DECLARATION_ITEMS = {
  HOUSEHOLD_GOODS: 336973
} as const;

export const GPOST_CURRENCIES = {
  GEL: 1,
  USD: 2,
  EUR: 3
} as const;

export const GPOST_LOCAL_DELIVERY_METHOD = 226;

/** Rolled carpet default height when product has no depth. */
export const DEFAULT_PACKAGE_HEIGHT_CM = 20;

export const DEFAULT_PRODUCT_WEIGHT_KG = 5;
export const DEFAULT_PRODUCT_LENGTH_CM = 200;
export const DEFAULT_PRODUCT_WIDTH_CM = 150;
