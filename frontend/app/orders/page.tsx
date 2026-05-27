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
    return <main className="mx-auto max-w-5xl p-8">Loading orders...</main>;
  }

  if (error) {
    return <main className="mx-auto max-w-5xl p-8 text-red-600">{error}</main>;
  }

  return (
    <main className="mx-auto max-w-5xl space-y-4 p-8">
      <h1 className="text-3xl font-semibold">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-stone-700">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-stone-600">
                    {new Date(order.createdAt).toLocaleString()} • {order.itemsCount} item(s)
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{order.total.toFixed(2)} GEL</p>
                  <p className="text-sm text-stone-600">{order.status}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
