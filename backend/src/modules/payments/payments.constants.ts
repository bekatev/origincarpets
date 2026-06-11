/** Bank transfer instructions shown at checkout (override via env). */
export const BANK_TRANSFER_DEFAULTS = {
  bankName: 'Bank of Georgia',
  accountHolder: 'Origin Carpets',
  iban: '',
  swift: 'BAGAGE22',
  contactEmail: 'info@origincarpets.com'
} as const;
