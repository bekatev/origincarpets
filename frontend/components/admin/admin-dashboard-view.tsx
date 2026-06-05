'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/components/providers/i18n-provider';
import { useAuth } from '@/components/providers/auth-provider';
import { readStoredToken } from '@/lib/auth';
import { cn } from '@/lib/cn';
import { API_ORIGIN, apiRequest, uploadImage } from '@/lib/api';
import type { Dictionary } from '@/lib/i18n';

type AdminTab = 'overview' | 'orders' | 'customers' | 'categories' | 'products';

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
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
  category: { id: string; name: string; slug: string };
  attributes: { size: string | null; color: string | null; material: string | null };
};

type AdminOverview = { orders: number; revenue: number; products: number; customers: number };

type AdminOrder = {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'CONFIRMED' | 'FULFILLED' | 'REFUNDED';
  total: number;
  createdAt: string;
  customer: { id: string; email: string; name: string | null };
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

const ORDER_STATUS_OPTIONS = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'] as const;

export function AdminDashboardView() {
  const { dict } = useI18n();
  const a = dict.admin;
  const { user } = useAuth();

  const [tab, setTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
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

  const token = readStoredToken();
  const isAdmin = user?.role === 'ADMIN';

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
    setLoading(true);
    void loadAll(token)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : a.loadFailed))
      .finally(() => setLoading(false));
  }, [token, isAdmin, a.loadFailed]);

  const parsedImages = useMemo(
    () =>
      productForm.imagesText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    [productForm.imagesText]
  );

  const tabs: Array<{ id: AdminTab; label: string }> = [
    { id: 'overview', label: a.tabs.overview },
    { id: 'orders', label: a.tabs.orders },
    { id: 'customers', label: a.tabs.customers },
    { id: 'categories', label: a.tabs.categories },
    { id: 'products', label: a.tabs.products }
  ];

  function flash(msg: string) {
    setMessage(msg);
    setError(null);
  }

  function flashError(msg: string) {
    setError(msg);
    setMessage(null);
  }

  async function onCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setBusy(true);
    try {
      await apiRequest('/products/categories', token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });
      setCategoryForm({ name: '', slug: '', description: '' });
      await loadAll(token);
      flash(a.categories.created);
    } catch (actionError) {
      flashError(actionError instanceof Error ? actionError.message : a.categories.createFailed);
    } finally {
      setBusy(false);
    }
  }

  async function onSubmitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setBusy(true);
    const wasEditing = Boolean(editingProductId);
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
      await apiRequest(path, token, {
        method: editingProductId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await loadAll(token);
      setProductForm((prev) => ({ ...emptyProduct, categoryId: prev.categoryId || categories[0]?.id || '' }));
      setEditingProductId(null);
      flash(wasEditing ? a.products.updated : a.products.created);
      setTab('products');
    } catch (actionError) {
      flashError(actionError instanceof Error ? actionError.message : a.products.saveFailed);
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteProduct(id: string) {
    if (!token || !window.confirm(a.products.deleteConfirm)) return;
    setBusy(true);
    try {
      await apiRequest(`/products/${id}`, token, { method: 'DELETE' });
      await loadAll(token);
      flash(a.products.deleted);
    } catch (actionError) {
      flashError(actionError instanceof Error ? actionError.message : a.products.deleteFailed);
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteCategory(id: string) {
    if (!token || !window.confirm(a.categories.deleteConfirm)) return;
    setBusy(true);
    try {
      await apiRequest(`/products/categories/${id}`, token, { method: 'DELETE' });
      await loadAll(token);
      flash(a.categories.deleted);
    } catch (actionError) {
      flashError(actionError instanceof Error ? actionError.message : a.categories.deleteFailed);
    } finally {
      setBusy(false);
    }
  }

  async function onUploadImage(file: File | null) {
    if (!file || !token) return;
    setBusy(true);
    try {
      const uploaded = await uploadImage(file, token);
      const fullUrl = `${API_ORIGIN}${uploaded.url}`;
      setProductForm((prev) => ({
        ...prev,
        imagesText: prev.imagesText ? `${prev.imagesText}\n${fullUrl}` : fullUrl
      }));
      flash(a.products.uploadSuccess);
    } catch (uploadError) {
      flashError(uploadError instanceof Error ? uploadError.message : a.products.uploadFailed);
    } finally {
      setBusy(false);
    }
  }

  async function onChangeOrderStatus(orderId: string, status: (typeof ORDER_STATUS_OPTIONS)[number]) {
    if (!token) return;
    setBusy(true);
    try {
      await apiRequest(`/admin/orders/${orderId}/status`, token, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      await loadAll(token);
      flash(a.orders.statusUpdated.replace('{status}', a.orders.status[status]));
    } catch (actionError) {
      flashError(actionError instanceof Error ? actionError.message : a.orders.updateFailed);
    } finally {
      setBusy(false);
    }
  }

  async function onSyncOrigincarpets(mode: 'sync' | 'full') {
    if (!token) return;
    setBusy(true);
    try {
      const result = await apiRequest<{ imported: number; skipped: number; totalFetched: number; mode: 'sync' | 'full' }>(
        `/admin/imports/origincarpets?mode=${mode}`,
        token,
        { method: 'POST' }
      );
      await loadAll(token);
      flash(
        a.sync.success
          .replace('{mode}', result.mode.toUpperCase())
          .replace('{imported}', String(result.imported))
          .replace('{skipped}', String(result.skipped))
          .replace('{total}', String(result.totalFetched))
      );
    } catch (actionError) {
      flashError(actionError instanceof Error ? actionError.message : a.sync.failed);
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
    setTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (!token || !isAdmin) return null;

  return (
    <main className="oc-section-tight pb-24">
      <div className="oc-container max-w-6xl">
        <header className="flex flex-wrap items-end justify-between gap-6 border-b border-[var(--oc-line)] pb-8">
          <div>
            <p className="oc-eyebrow">{a.title}</p>
            <h1 className="oc-heading-sm mt-2">{a.title}</h1>
            <p className="oc-body mt-3 max-w-xl">{a.subtitle}</p>
          </div>
          <Link href="/products" className="oc-btn-ghost">
            ← {a.backToShop}
          </Link>
        </header>

        <nav className="mt-8 flex flex-wrap gap-2 border-b border-[var(--oc-line)] pb-px">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                'px-4 py-3 text-[10px] font-medium uppercase tracking-[0.22em] transition',
                tab === item.id
                  ? 'border-b border-[var(--oc-ink)] text-[var(--oc-ink)]'
                  : 'text-[var(--oc-muted)] hover:text-[var(--oc-ink)]'
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <AnimatePresence mode="wait">
          {(error || message) && (
            <motion.div
              key={error ? 'err' : 'ok'}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                'mt-6 border px-4 py-3 text-sm',
                error
                  ? 'border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-200'
                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
              )}
            >
              {error ?? message}
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <p className="oc-body mt-12">{a.loading}</p>
        ) : (
          <div className="mt-10">
            {tab === 'overview' && (
              <OverviewTab
                a={a}
                overview={overview}
                busy={busy}
                onSync={onSyncOrigincarpets}
              />
            )}
            {tab === 'orders' && (
              <OrdersTab a={a} orders={orders} busy={busy} onStatusChange={onChangeOrderStatus} />
            )}
            {tab === 'customers' && <CustomersTab a={a} customers={customers} />}
            {tab === 'categories' && (
              <CategoriesTab
                a={a}
                categories={categories}
                categoryForm={categoryForm}
                setCategoryForm={setCategoryForm}
                busy={busy}
                onSubmit={onCreateCategory}
                onDelete={onDeleteCategory}
              />
            )}
            {tab === 'products' && (
              <ProductsTab
                a={a}
                products={products}
                categories={categories}
                productForm={productForm}
                setProductForm={setProductForm}
                editingProductId={editingProductId}
                busy={busy}
                onSubmit={onSubmitProduct}
                onUpload={onUploadImage}
                onEdit={startEdit}
                onDelete={onDeleteProduct}
                onCancelEdit={() => {
                  setEditingProductId(null);
                  setProductForm({ ...emptyProduct, categoryId: categories[0]?.id ?? '' });
                }}
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}

type AdminDict = Dictionary['admin'];

function OverviewTab({
  a,
  overview,
  busy,
  onSync
}: {
  a: AdminDict;
  overview: AdminOverview | null;
  busy: boolean;
  onSync: (mode: 'sync' | 'full') => void;
}) {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label={a.metrics.orders} value={overview?.orders ?? 0} />
        <MetricCard label={a.metrics.revenue} value={`${(overview?.revenue ?? 0).toFixed(2)} GEL`} />
        <MetricCard label={a.metrics.products} value={overview?.products ?? 0} />
        <MetricCard label={a.metrics.customers} value={overview?.customers ?? 0} />
      </section>
      <section className="oc-surface p-6 sm:p-8">
        <h2 className="font-display text-xl uppercase tracking-[0.1em]">{a.sync.sync}</h2>
        <p className="oc-body mt-2">{a.subtitle}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" disabled={busy} className="oc-btn-secondary" onClick={() => onSync('sync')}>
            {a.sync.sync}
          </button>
          <button type="button" disabled={busy} className="oc-btn-primary" onClick={() => onSync('full')}>
            {a.sync.full}
          </button>
        </div>
      </section>
    </div>
  );
}

function OrdersTab({
  a,
  orders,
  busy,
  onStatusChange
}: {
  a: AdminDict;
  orders: AdminOrder[];
  busy: boolean;
  onStatusChange: (id: string, status: (typeof ORDER_STATUS_OPTIONS)[number]) => void;
}) {
  if (!orders.length) {
    return <EmptyState text={a.orders.empty} />;
  }

  return (
    <section className="space-y-3">
      <h2 className="oc-eyebrow">{a.orders.title}</h2>
      {orders.map((order) => (
        <article key={order.id} className="oc-surface p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-display text-lg uppercase tracking-[0.08em]">{order.orderNumber}</p>
              <p className="mt-1 text-sm text-[var(--oc-muted)]">
                {order.customer.name || order.customer.email}
              </p>
              <p className="text-xs text-[var(--oc-muted)]">
                {new Date(order.createdAt).toLocaleString()} ·{' '}
                {a.orders.items.replace('{count}', String(order.itemsCount))}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold uppercase tracking-[0.08em]">
                {order.total.toFixed(2)} GEL
              </span>
              <select
                className="oc-input min-w-[10rem] py-2 text-sm"
                value={order.status}
                onChange={(e) => onStatusChange(order.id, e.target.value as (typeof ORDER_STATUS_OPTIONS)[number])}
                disabled={busy}
              >
                {ORDER_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {a.orders.status[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

function CustomersTab({ a, customers }: { a: AdminDict; customers: Customer[] }) {
  if (!customers.length) return <EmptyState text={a.customers.empty} />;

  return (
    <section>
      <h2 className="oc-eyebrow mb-6">{a.customers.title}</h2>
      <div className="oc-surface overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--oc-line)] bg-[var(--oc-bg-secondary)]">
            <tr>
              <th className="px-4 py-3 font-medium uppercase tracking-[0.14em] text-[var(--oc-muted)]">Email</th>
              <th className="hidden px-4 py-3 font-medium uppercase tracking-[0.14em] text-[var(--oc-muted)] sm:table-cell">Name</th>
              <th className="px-4 py-3 font-medium uppercase tracking-[0.14em] text-[var(--oc-muted)]">{a.customers.orders}</th>
              <th className="px-4 py-3 font-medium uppercase tracking-[0.14em] text-[var(--oc-muted)]">{a.customers.spent}</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-[var(--oc-line)] last:border-0">
                <td className="px-4 py-3">{customer.email}</td>
                <td className="hidden px-4 py-3 text-[var(--oc-muted)] sm:table-cell">
                  {customer.fullName || a.customers.unnamed}
                </td>
                <td className="px-4 py-3">{customer.ordersCount}</td>
                <td className="px-4 py-3">{customer.spentTotal.toFixed(2)} GEL</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CategoriesTab({
  a,
  categories,
  categoryForm,
  setCategoryForm,
  busy,
  onSubmit,
  onDelete
}: {
  a: AdminDict;
  categories: Category[];
  categoryForm: { name: string; slug: string; description: string };
  setCategoryForm: Dispatch<SetStateAction<{ name: string; slug: string; description: string }>>;
  busy: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
      <section className="oc-surface p-6">
        <h2 className="font-display text-xl uppercase tracking-[0.1em]">{a.categories.create}</h2>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label={a.categories.name}>
            <input
              className="oc-input"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </Field>
          <Field label={a.categories.slug}>
            <input
              className="oc-input"
              value={categoryForm.slug}
              onChange={(e) => setCategoryForm((p) => ({ ...p, slug: e.target.value }))}
              required
            />
          </Field>
          <Field label={a.categories.description}>
            <input
              className="oc-input"
              value={categoryForm.description}
              onChange={(e) => setCategoryForm((p) => ({ ...p, description: e.target.value }))}
            />
          </Field>
          <button className="oc-btn-primary w-full sm:w-auto" disabled={busy} type="submit">
            {a.categories.add}
          </button>
        </form>
      </section>

      <section>
        <h2 className="oc-eyebrow mb-4">{a.categories.title}</h2>
        {!categories.length ? (
          <EmptyState text={a.categories.empty} />
        ) : (
          <ul className="space-y-2">
            {categories.map((category) => (
              <li
                key={category.id}
                className="oc-surface flex items-center justify-between gap-4 px-4 py-3 text-sm"
              >
                <span>
                  <span className="font-medium text-[var(--oc-ink)]">{category.name}</span>
                  <span className="ml-2 text-[var(--oc-muted)]">/{category.slug}</span>
                </span>
                <button
                  type="button"
                  className="text-xs uppercase tracking-[0.14em] text-red-600 hover:underline dark:text-red-400"
                  onClick={() => onDelete(category.id)}
                >
                  {a.categories.delete}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ProductsTab({
  a,
  products,
  categories,
  productForm,
  setProductForm,
  editingProductId,
  busy,
  onSubmit,
  onUpload,
  onEdit,
  onDelete,
  onCancelEdit
}: {
  a: AdminDict;
  products: Product[];
  categories: Category[];
  productForm: ProductFormState;
  setProductForm: Dispatch<SetStateAction<ProductFormState>>;
  editingProductId: string | null;
  busy: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onUpload: (file: File | null) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onCancelEdit: () => void;
}) {
  return (
    <div className="space-y-12">
      <section className="oc-surface p-6 sm:p-8">
        <h2 className="font-display text-xl uppercase tracking-[0.1em]">
          {editingProductId ? a.products.edit : a.products.create}
        </h2>
        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label={a.products.titleLabel}>
              <input className="oc-input" value={productForm.title} onChange={(e) => setProductForm((p) => ({ ...p, title: e.target.value }))} required />
            </Field>
            <Field label={a.products.slug}>
              <input className="oc-input" value={productForm.slug} onChange={(e) => setProductForm((p) => ({ ...p, slug: e.target.value }))} required />
            </Field>
            <Field label={a.products.sku}>
              <input className="oc-input" value={productForm.sku} onChange={(e) => setProductForm((p) => ({ ...p, sku: e.target.value }))} required />
            </Field>
          </div>
          <Field label={a.products.description}>
            <textarea className="oc-input min-h-28" value={productForm.description} onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))} required />
          </Field>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Field label={a.products.price}>
              <input type="number" min={0} step="0.01" className="oc-input" value={productForm.price} onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))} required />
            </Field>
            <Field label={a.products.category}>
              <select className="oc-input" value={productForm.categoryId} onChange={(e) => setProductForm((p) => ({ ...p, categoryId: e.target.value }))} required>
                <option value="">{a.products.selectCategory}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label={a.products.size}>
              <input className="oc-input" value={productForm.size} onChange={(e) => setProductForm((p) => ({ ...p, size: e.target.value }))} />
            </Field>
            <Field label={a.products.color}>
              <input className="oc-input" value={productForm.color} onChange={(e) => setProductForm((p) => ({ ...p, color: e.target.value }))} />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={a.products.material}>
              <input className="oc-input" value={productForm.material} onChange={(e) => setProductForm((p) => ({ ...p, material: e.target.value }))} />
            </Field>
            <label className="flex cursor-pointer items-center gap-3 border border-[var(--oc-line)] px-4 py-3 text-sm">
              <input type="checkbox" checked={productForm.isActive} onChange={(e) => setProductForm((p) => ({ ...p, isActive: e.target.checked }))} />
              {a.products.active}
            </label>
          </div>
          <Field label={a.products.uploadImage}>
            <input type="file" accept="image/*" className="text-sm" onChange={(e) => onUpload(e.target.files?.[0] ?? null)} />
          </Field>
          <Field label={a.products.imageUrls}>
            <textarea className="oc-input min-h-24 font-mono text-xs" value={productForm.imagesText} onChange={(e) => setProductForm((p) => ({ ...p, imagesText: e.target.value }))} />
          </Field>
          <div className="flex flex-wrap gap-3">
            <button className="oc-btn-primary" disabled={busy} type="submit">
              {editingProductId ? a.products.saveBtn : a.products.createBtn}
            </button>
            {editingProductId && (
              <button type="button" className="oc-btn-secondary" onClick={onCancelEdit}>
                {a.products.cancelEdit}
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <h2 className="oc-eyebrow mb-6">{a.products.existing}</h2>
        {!products.length ? (
          <EmptyState text={a.products.empty} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {products.map((product) => (
              <article key={product.id} className="oc-surface overflow-hidden">
                {product.images[0] && (
                  <div className="relative aspect-[4/3] border-b border-[var(--oc-line)] bg-[var(--oc-bg-secondary)]">
                    <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-base uppercase tracking-[0.06em]">{product.title}</h3>
                    {!product.isActive && (
                      <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-[var(--oc-muted)]">
                        {a.products.inactive}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[var(--oc-muted)]">
                    {product.category.name} · ${product.price.toFixed(2)}
                  </p>
                  <div className="mt-4 flex gap-4 text-xs uppercase tracking-[0.14em]">
                    <button type="button" className="text-[var(--oc-brand)] hover:underline" onClick={() => onEdit(product)}>
                      {a.products.editBtn}
                    </button>
                    <button type="button" className="text-red-600 hover:underline dark:text-red-400" onClick={() => onDelete(product.id)}>
                      {a.products.deleteBtn}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--oc-muted)]">{label}</span>
      {children}
    </label>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="oc-surface p-5 sm:p-6">
      <p className="oc-eyebrow">{label}</p>
      <p className="mt-3 font-display text-3xl uppercase tracking-[0.06em] text-[var(--oc-ink)]">{value}</p>
    </article>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="oc-surface border-dashed px-6 py-16 text-center">
      <p className="text-sm text-[var(--oc-muted)]">{text}</p>
    </div>
  );
}
