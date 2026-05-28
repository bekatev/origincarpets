'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { API_ORIGIN, apiRequest, uploadImage } from '@/lib/api';

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

type Product = {
  id: string;
  slug: string;
  sku: string;
  title: string;
  description: string;
  price: number;
  isActive: boolean;
  images: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  attributes: {
    size: string | null;
    color: string | null;
    material: string | null;
  };
};

type AdminOverview = {
  orders: number;
  revenue: number;
  products: number;
  customers: number;
};

type AdminOrder = {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'CONFIRMED' | 'FULFILLED' | 'REFUNDED';
  total: number;
  createdAt: string;
  customer: {
    id: string;
    email: string;
    name: string | null;
  };
  itemsCount: number;
};

type Customer = {
  id: string;
  email: string;
  fullName: string | null;
  createdAt: string;
  ordersCount: number;
  spentTotal: number;
};

type ProductFormState = {
  title: string;
  slug: string;
  sku: string;
  description: string;
  price: string;
  categoryId: string;
  size: string;
  color: string;
  material: string;
  imagesText: string;
  isActive: boolean;
};

const emptyProduct: ProductFormState = {
  title: '',
  slug: '',
  sku: '',
  description: '',
  price: '',
  categoryId: '',
  size: '',
  color: '',
  material: '',
  imagesText: '',
  isActive: true
};

const ORDER_STATUS_OPTIONS: Array<'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED'> = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'];

export default function AdminDashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '' });
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProduct);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const userRaw = localStorage.getItem('auth_user');
    const user = userRaw ? (JSON.parse(userRaw) as { role?: string }) : null;

    setToken(storedToken);
    setIsAdmin(user?.role === 'ADMIN');
  }, []);

  async function loadAll(authToken: string) {
    const [overviewData, ordersData, customersData, categoryData, productData] = await Promise.all([
      apiRequest<AdminOverview>('/admin/overview', authToken),
      apiRequest<AdminOrder[]>('/admin/orders', authToken),
      apiRequest<Customer[]>('/admin/customers', authToken),
      apiRequest<Category[]>('/products/admin/categories/all', authToken),
      apiRequest<{ items: Product[] }>('/products/admin/all?limit=200', authToken)
    ]);

    setOverview(overviewData);
    setOrders(ordersData);
    setCustomers(customersData);
    setCategories(categoryData);
    setProducts(productData.items);

    if (!productForm.categoryId && categoryData.length) {
      setProductForm((prev) => ({ ...prev, categoryId: categoryData[0].id }));
    }
  }

  useEffect(() => {
    if (!token || !isAdmin) return;
    void loadAll(token).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : 'Failed loading admin data');
    });
  }, [token, isAdmin]);

  const parsedImages = useMemo(
    () =>
      productForm.imagesText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    [productForm.imagesText]
  );

  async function onCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      await apiRequest('/products/categories', token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });
      setCategoryForm({ name: '', slug: '', description: '' });
      await loadAll(token);
      setMessage('Category created');
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to create category');
    } finally {
      setBusy(false);
    }
  }

  async function onSubmitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        title: productForm.title,
        slug: productForm.slug,
        sku: productForm.sku,
        description: productForm.description,
        price: Number(productForm.price),
        categoryId: productForm.categoryId,
        size: productForm.size || undefined,
        color: productForm.color || undefined,
        material: productForm.material || undefined,
        images: parsedImages,
        isActive: productForm.isActive
      };

      const path = editingProductId ? `/products/${editingProductId}` : '/products';
      const method = editingProductId ? 'PATCH' : 'POST';

      await apiRequest(path, token, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      await loadAll(token);
      setProductForm((prev) => ({ ...emptyProduct, categoryId: prev.categoryId || categories[0]?.id || '' }));
      setEditingProductId(null);
      setMessage(editingProductId ? 'Product updated' : 'Product created');
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to save product');
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteProduct(id: string) {
    if (!token || !window.confirm('Delete this product?')) return;

    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      await apiRequest(`/products/${id}`, token, { method: 'DELETE' });
      await loadAll(token);
      setMessage('Product deleted');
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to delete product');
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteCategory(id: string) {
    if (!token || !window.confirm('Delete this category?')) return;

    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      await apiRequest(`/products/categories/${id}`, token, { method: 'DELETE' });
      await loadAll(token);
      setMessage('Category deleted');
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to delete category');
    } finally {
      setBusy(false);
    }
  }

  async function onUploadImage(file: File | null) {
    if (!file || !token) return;

    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const uploaded = await uploadImage(file, token);
      const fullUrl = `${API_ORIGIN}${uploaded.url}`;
      setProductForm((prev) => ({
        ...prev,
        imagesText: prev.imagesText ? `${prev.imagesText}\n${fullUrl}` : fullUrl
      }));
      setMessage('Image uploaded');
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Image upload failed');
    } finally {
      setBusy(false);
    }
  }

  async function onChangeOrderStatus(orderId: string, status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED') {
    if (!token) return;

    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      await apiRequest(`/admin/orders/${orderId}/status`, token, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      await loadAll(token);
      setMessage(`Order status updated to ${status}`);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed updating order status');
    } finally {
      setBusy(false);
    }
  }

  async function onSyncOrigincarpets(mode: 'sync' | 'full') {
    if (!token) return;

    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const result = await apiRequest<{ imported: number; skipped: number; totalFetched: number; mode: 'sync' | 'full' }>(
        `/admin/imports/origincarpets?mode=${mode}`,
        token,
        { method: 'POST' }
      );
      await loadAll(token);
      setMessage(
        `Origin Carpets ${result.mode.toUpperCase()} completed: imported ${result.imported}, skipped ${result.skipped}, total ${result.totalFetched}.`
      );
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to sync Origin Carpets products');
    } finally {
      setBusy(false);
    }
  }

  function startEdit(product: Product) {
    setEditingProductId(product.id);
    setProductForm({
      title: product.title,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      price: product.price.toString(),
      categoryId: product.category.id,
      size: product.attributes.size ?? '',
      color: product.attributes.color ?? '',
      material: product.attributes.material ?? '',
      imagesText: product.images.join('\n'),
      isActive: product.isActive
    });
  }

  if (!token) {
    return <main className="oc-container oc-section max-w-6xl">Please login first to access admin dashboard.</main>;
  }

  if (!isAdmin) {
    return <main className="oc-container oc-section max-w-6xl">Only ADMIN users can access this page.</main>;
  }

  return (
    <main className="oc-section">
      <div className="oc-container max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="oc-heading">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-[var(--oc-muted)]">Overview, orders, products, and customers management.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={busy} className="oc-btn-secondary" onClick={() => void onSyncOrigincarpets('sync')}>
            Sync Origin Carpets
          </button>
          <button type="button" disabled={busy} className="oc-btn-primary" onClick={() => void onSyncOrigincarpets('full')}>
            Full Reimport
          </button>
        </div>
      </header>

      {error && <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p className="border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</p>}

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Orders" value={overview?.orders ?? 0} />
        <MetricCard label="Revenue" value={`${(overview?.revenue ?? 0).toFixed(2)} GEL`} />
        <MetricCard label="Products" value={overview?.products ?? 0} />
        <MetricCard label="Customers" value={overview?.customers ?? 0} />
      </section>

      <section className="oc-surface p-5">
        <h2 className="font-display text-2xl uppercase tracking-[0.1em]">Order Management</h2>
        <div className="mt-4 space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="border border-[var(--oc-line)] bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg uppercase tracking-[0.08em]">{order.orderNumber}</p>
                  <p className="text-sm text-[var(--oc-muted)]">
                    {order.customer.name || order.customer.email} • {order.itemsCount} item(s) • {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold uppercase tracking-[0.08em]">{order.total.toFixed(2)} GEL</span>
                  <select
                    className="oc-input py-1 text-sm"
                    value={order.status}
                    onChange={(event) => void onChangeOrderStatus(order.id, event.target.value as 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED')}
                    disabled={busy}
                  >
                    {ORDER_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="oc-surface p-5">
        <h2 className="font-display text-2xl uppercase tracking-[0.1em]">Customer List</h2>
        <div className="mt-4 grid gap-2 text-sm">
          {customers.map((customer) => (
            <div key={customer.id} className="flex flex-wrap items-center justify-between border border-[var(--oc-line)] bg-white px-3 py-2">
              <span>
                {customer.fullName || 'Unnamed'} <span className="text-[var(--oc-muted)]">({customer.email})</span>
              </span>
              <span className="text-[var(--oc-muted)]">
                Orders: {customer.ordersCount} • Spent: {customer.spentTotal.toFixed(2)} GEL
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="oc-surface p-5">
        <h2 className="font-display text-2xl uppercase tracking-[0.1em]">Create Category</h2>
        <form onSubmit={onCreateCategory} className="mt-4 grid gap-3 md:grid-cols-4">
          <input className="oc-input" placeholder="Name" value={categoryForm.name} onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))} required />
          <input className="oc-input" placeholder="Slug" value={categoryForm.slug} onChange={(e) => setCategoryForm((prev) => ({ ...prev, slug: e.target.value }))} required />
          <input className="oc-input" placeholder="Description" value={categoryForm.description} onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))} />
          <button className="oc-btn-primary" disabled={busy} type="submit">
            Add category
          </button>
        </form>

        <div className="mt-4 space-y-2 text-sm">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between border border-[var(--oc-line)] bg-white px-3 py-2">
              <span>
                {category.name} <span className="text-[var(--oc-muted)]">({category.slug})</span>
              </span>
              <button type="button" className="text-red-600 hover:underline" onClick={() => void onDeleteCategory(category.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="oc-surface p-5">
        <h2 className="font-display text-2xl uppercase tracking-[0.1em]">{editingProductId ? 'Edit Product' : 'Create Product'}</h2>

        <form onSubmit={onSubmitProduct} className="mt-4 space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <input className="oc-input" placeholder="Title" value={productForm.title} onChange={(e) => setProductForm((prev) => ({ ...prev, title: e.target.value }))} required />
            <input className="oc-input" placeholder="Slug" value={productForm.slug} onChange={(e) => setProductForm((prev) => ({ ...prev, slug: e.target.value }))} required />
            <input className="oc-input" placeholder="SKU" value={productForm.sku} onChange={(e) => setProductForm((prev) => ({ ...prev, sku: e.target.value }))} required />
          </div>

          <textarea className="oc-input min-h-28" placeholder="Description" value={productForm.description} onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))} required />

          <div className="grid gap-3 md:grid-cols-4">
            <input type="number" min={0} step="0.01" className="oc-input" placeholder="Price" value={productForm.price} onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))} required />
            <select className="oc-input" value={productForm.categoryId} onChange={(e) => setProductForm((prev) => ({ ...prev, categoryId: e.target.value }))} required>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input className="oc-input" placeholder="Size" value={productForm.size} onChange={(e) => setProductForm((prev) => ({ ...prev, size: e.target.value }))} />
            <input className="oc-input" placeholder="Color" value={productForm.color} onChange={(e) => setProductForm((prev) => ({ ...prev, color: e.target.value }))} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <input className="oc-input" placeholder="Material" value={productForm.material} onChange={(e) => setProductForm((prev) => ({ ...prev, material: e.target.value }))} />
            <label className="flex items-center gap-2 border border-[var(--oc-line)] bg-white px-3 py-2 text-sm">
              <input type="checkbox" checked={productForm.isActive} onChange={(e) => setProductForm((prev) => ({ ...prev, isActive: e.target.checked }))} />
              Product active
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Upload image</label>
            <input type="file" accept="image/*" onChange={(e) => void onUploadImage(e.target.files?.[0] ?? null)} />
          </div>

          <textarea className="oc-input min-h-24" placeholder="Image URLs (one per line)" value={productForm.imagesText} onChange={(e) => setProductForm((prev) => ({ ...prev, imagesText: e.target.value }))} />

          <div className="flex gap-3">
            <button className="oc-btn-primary" disabled={busy} type="submit">
              {editingProductId ? 'Save changes' : 'Create product'}
            </button>
            {editingProductId && (
              <button
                type="button"
                className="oc-btn-secondary"
                onClick={() => {
                  setEditingProductId(null);
                  setProductForm({ ...emptyProduct, categoryId: categories[0]?.id ?? '' });
                }}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl uppercase tracking-[0.1em]">Existing Products</h2>
        {products.map((product) => (
          <article key={product.id} className="oc-surface p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-xl uppercase tracking-[0.08em]">{product.title}</h3>
                <p className="text-sm text-[var(--oc-muted)]">
                  {product.category.name} • {product.price.toFixed(2)} GEL
                </p>
                <p className="mt-1 text-sm text-[var(--oc-muted)]">{product.slug}</p>
              </div>
              <div className="flex gap-3 text-sm">
                <button className="text-[var(--oc-brand)] hover:underline" onClick={() => startEdit(product)}>
                  Edit
                </button>
                <button className="text-red-600 hover:underline" onClick={() => void onDeleteProduct(product.id)}>
                  Delete
                </button>
              </div>
            </div>
            {product.images[0] && <img src={product.images[0]} alt={product.title} className="mt-3 h-32 w-48 border border-[var(--oc-line)] object-cover" />}
          </article>
        ))}
      </section>
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="oc-surface p-4">
      <p className="oc-kicker">{label}</p>
      <p className="mt-2 font-display text-3xl uppercase tracking-[0.08em]">{value}</p>
    </article>
  );
}
