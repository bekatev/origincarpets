'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RequireAuth } from '@/components/auth/require-auth';
import { useCurrency } from '@/components/providers/currency-provider';
import { useI18n } from '@/components/providers/i18n-provider';
import { readStoredToken } from '@/lib/auth';
import { apiRequest } from '@/lib/api';

type OrderSummary = {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'CONFIRMED' | 'FULFILLED' | 'REFUNDED';
  total: number;
  createdAt: string;
  itemsCount: number;
  parcelTrackingNumber?: string | null;
};

export default function OrdersPage() {
  const { formatPrice } = useCurrency();
  const { dict } = useI18n();
  const o = dict.orders;
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = readStoredToken();
    if (!token) return;

    void apiRequest<OrderSummary[]>('/orders/me', token)
      .then((data) => setOrders(data))
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : o.loadFailed))
      .finally(() => setLoading(false));
  }, [o.loginRequired, o.loadFailed]);

  return (
    <RequireAuth>
    {loading ? (
      <main className="oc-container oc-section max-w-5xl">{o.loading}</main>
    ) : error ? (
      <main className="oc-container oc-section max-w-5xl text-red-700">{error}</main>
    ) : (
    <main className="oc-section">
      <div className="oc-container max-w-5xl space-y-5">
        <h1 className="oc-heading">{o.title}</h1>
        {orders.length === 0 ? (
          <p className="text-sm text-[var(--oc-muted)]">{o.empty}</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <motion.article
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="oc-surface p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-lg uppercase tracking-[0.08em]">{order.orderNumber}</p>
                    <p className="text-sm text-[var(--oc-muted)]">
                      {new Date(order.createdAt).toLocaleString()} • {order.itemsCount} {o.items}
                    </p>
                    {order.parcelTrackingNumber && (
                      <p className="mt-1 text-xs text-[var(--oc-muted)]">
                        {o.tracking}: {order.parcelTrackingNumber}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold uppercase tracking-[0.08em]">{formatPrice(order.total)}</p>
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--oc-muted)]">{order.status}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </main>
    )}
    </RequireAuth>
  );
}
