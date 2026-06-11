import { API_URL } from '@/lib/api';
import { apiRequest } from '@/lib/api';

export type PaymentConfig = {
  card: boolean;
};

export async function fetchPaymentConfig(): Promise<PaymentConfig> {
  const response = await fetch(`${API_URL}/payments/config`, { cache: 'no-store' });
  if (!response.ok) {
    return { card: false };
  }
  return response.json() as Promise<PaymentConfig>;
}

export async function startIpayPayment(
  token: string,
  orderId: string
): Promise<{ orderId: string; paymentUrl: string; trxIdentifier: string }> {
  return apiRequest('/payments/ipay/start', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId })
  });
}
