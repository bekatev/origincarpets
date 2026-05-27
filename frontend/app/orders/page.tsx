'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';

type OrderSummary = {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'CONFIRMED' | 'FULFILLED' | 'REFUNDED';
  total: number;
  createdAt: string;
  itemsCount: number;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setError('Please login to view your orders.');
      setLoading(false);
      return;
    }

    void apiRequest<OrderSummary[]>('/orders/me', token)
      .then((data) => setOrders(data))
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Failed loading orders'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <main className="oc-container oc-section max-w-5xl">Loading orders...</main>;
  }

  if (error) {
    return <main className="oc-container oc-section max-w-5xl text-red-700">{error}</main>;
  }

  return (
    <main className="oc-section">
      <div className="oc-container max-w-5xl space-y-5">
        <h1 className="oc-heading">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-sm text-[var(--oc-muted)]">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="oc-surface p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-lg uppercase tracking-[0.08em]">{order.orderNumber}</p>
                  <p className="text-sm text-[var(--oc-muted)]">
                    {new Date(order.createdAt).toLocaleString()} • {order.itemsCount} item(s)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold uppercase tracking-[0.08em]">{order.total.toFixed(2)} GEL</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--oc-muted)]">{order.status}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      </div>
    </main>
  );
}
