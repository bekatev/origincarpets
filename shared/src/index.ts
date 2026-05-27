export type CurrencyCode = 'GEL' | 'USD' | 'EUR';

export type ShippingRegion = 'GEORGIA_LOCAL' | 'INTERNATIONAL';

export interface Money {
  amount: number;
  currency: CurrencyCode;
}

export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  price: Money;
  inStock: boolean;
}
