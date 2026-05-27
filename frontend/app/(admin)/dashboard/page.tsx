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
    return <main className="mx-auto max-w-6xl p-8">Please login first to access admin dashboard.</main>;
  }

  if (!isAdmin) {
    return <main className="mx-auto max-w-6xl p-8">Only ADMIN users can access this page.</main>;
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-8">
      <header>
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
        <p className="mt-2 text-stone-700">Overview, orders, products, and customers management.</p>
      </header>

      {error && <p className="rounded-md bg-red-50 p-3 text-red-700">{error}</p>}
      {message && <p className="rounded-md bg-green-50 p-3 text-green-700">{message}</p>}

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Orders" value={overview?.orders ?? 0} />
        <MetricCard label="Revenue" value={`${(overview?.revenue ?? 0).toFixed(2)} GEL`} />
        <MetricCard label="Products" value={overview?.products ?? 0} />
        <MetricCard label="Customers" value={overview?.customers ?? 0} />
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5">
        <h2 className="text-xl font-semibold">Order Management</h2>
        <div className="mt-4 space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="rounded-md border border-stone-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-stone-600">
                    {order.customer.name || order.customer.email} • {order.itemsCount} item(s) • {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{order.total.toFixed(2)} GEL</span>
                  <select
                    className="rounded border border-stone-300 px-2 py-1 text-sm"
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

      <section className="rounded-lg border border-stone-200 bg-white p-5">
        <h2 className="text-xl font-semibold">Customer List</h2>
        <div className="mt-4 grid gap-2 text-sm">
          {customers.map((customer) => (
            <div key={customer.id} className="flex flex-wrap items-center justify-between rounded border border-stone-100 px-3 py-2">
              <span>
                {customer.fullName || 'Unnamed'} <span className="text-stone-500">({customer.email})</span>
              </span>
              <span className="text-stone-600">
                Orders: {customer.ordersCount} • Spent: {customer.spentTotal.toFixed(2)} GEL
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5">
        <h2 className="text-xl font-semibold">Create Category</h2>
        <form onSubmit={onCreateCategory} className="mt-4 grid gap-3 md:grid-cols-4">
          <input className="rounded-md border border-stone-300 px-3 py-2" placeholder="Name" value={categoryForm.name} onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))} required />
          <input className="rounded-md border border-stone-300 px-3 py-2" placeholder="Slug" value={categoryForm.slug} onChange={(e) => setCategoryForm((prev) => ({ ...prev, slug: e.target.value }))} required />
          <input className="rounded-md border border-stone-300 px-3 py-2" placeholder="Description" value={categoryForm.description} onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))} />
          <button className="rounded-md bg-brand-700 px-4 py-2 text-white" disabled={busy} type="submit">
            Add category
          </button>
        </form>

        <div className="mt-4 space-y-2 text-sm">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between rounded-md border border-stone-100 px-3 py-2">
              <span>
                {category.name} <span className="text-stone-500">({category.slug})</span>
              </span>
              <button type="button" className="text-red-600 hover:underline" onClick={() => void onDeleteCategory(category.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5">
        <h2 className="text-xl font-semibold">{editingProductId ? 'Edit Product' : 'Create Product'}</h2>

        <form onSubmit={onSubmitProduct} className="mt-4 space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <input className="rounded-md border border-stone-300 px-3 py-2" placeholder="Title" value={productForm.title} onChange={(e) => setProductForm((prev) => ({ ...prev, title: e.target.value }))} required />
            <input className="rounded-md border border-stone-300 px-3 py-2" placeholder="Slug" value={productForm.slug} onChange={(e) => setProductForm((prev) => ({ ...prev, slug: e.target.value }))} required />
            <input className="rounded-md border border-stone-300 px-3 py-2" placeholder="SKU" value={productForm.sku} onChange={(e) => setProductForm((prev) => ({ ...prev, sku: e.target.value }))} required />
          </div>

          <textarea className="min-h-28 w-full rounded-md border border-stone-300 px-3 py-2" placeholder="Description" value={productForm.description} onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))} required />

          <div className="grid gap-3 md:grid-cols-4">
            <input type="number" min={0} step="0.01" className="rounded-md border border-stone-300 px-3 py-2" placeholder="Price" value={productForm.price} onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))} required />
            <select className="rounded-md border border-stone-300 px-3 py-2" value={productForm.categoryId} onChange={(e) => setProductForm((prev) => ({ ...prev, categoryId: e.target.value }))} required>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input className="rounded-md border border-stone-300 px-3 py-2" placeholder="Size" value={productForm.size} onChange={(e) => setProductForm((prev) => ({ ...prev, size: e.target.value }))} />
            <input className="rounded-md border border-stone-300 px-3 py-2" placeholder="Color" value={productForm.color} onChange={(e) => setProductForm((prev) => ({ ...prev, color: e.target.value }))} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <input className="rounded-md border border-stone-300 px-3 py-2" placeholder="Material" value={productForm.material} onChange={(e) => setProductForm((prev) => ({ ...prev, material: e.target.value }))} />
            <label className="flex items-center gap-2 rounded-md border border-stone-300 px-3 py-2 text-sm">
              <input type="checkbox" checked={productForm.isActive} onChange={(e) => setProductForm((prev) => ({ ...prev, isActive: e.target.checked }))} />
              Product active
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Upload image</label>
            <input type="file" accept="image/*" onChange={(e) => void onUploadImage(e.target.files?.[0] ?? null)} />
          </div>

          <textarea className="min-h-24 w-full rounded-md border border-stone-300 px-3 py-2" placeholder="Image URLs (one per line)" value={productForm.imagesText} onChange={(e) => setProductForm((prev) => ({ ...prev, imagesText: e.target.value }))} />

          <div className="flex gap-3">
            <button className="rounded-md bg-brand-700 px-4 py-2 text-white" disabled={busy} type="submit">
              {editingProductId ? 'Save changes' : 'Create product'}
            </button>
            {editingProductId && (
              <button
                type="button"
                className="rounded-md border border-stone-300 px-4 py-2"
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
        <h2 className="text-xl font-semibold">Existing Products</h2>
        {products.map((product) => (
          <article key={product.id} className="rounded-lg border border-stone-200 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{product.title}</h3>
                <p className="text-sm text-stone-600">
                  {product.category.name} • {product.price.toFixed(2)} GEL
                </p>
                <p className="mt-1 text-sm text-stone-500">{product.slug}</p>
              </div>
              <div className="flex gap-3 text-sm">
                <button className="text-brand-700 hover:underline" onClick={() => startEdit(product)}>
                  Edit
                </button>
                <button className="text-red-600 hover:underline" onClick={() => void onDeleteProduct(product.id)}>
                  Delete
                </button>
              </div>
            </div>
            {product.images[0] && <img src={product.images[0]} alt={product.title} className="mt-3 h-32 w-48 rounded-md border border-stone-200 object-cover" />}
          </article>
        ))}
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-4">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </article>
  );
}
