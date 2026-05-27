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

export default function AdminDashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
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
    const [categoryData, productData] = await Promise.all([
      apiRequest<Category[]>('/products/admin/categories/all', authToken),
      apiRequest<{ items: Product[] }>('/products/admin/all?limit=100', authToken)
    ]);

    setCategories(categoryData);
    setProducts(productData.items);

    if (!productForm.categoryId && categoryData.length) {
      setProductForm((prev) => ({ ...prev, categoryId: categoryData[0].id }));
    }
  }

  useEffect(() => {
    if (!token || !isAdmin) {
      return;
    }

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
    if (!token) return;
    if (!window.confirm('Delete this product?')) return;

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
    if (!token) return;
    if (!window.confirm('Delete this category?')) return;

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
    return <main className="mx-auto max-w-5xl p-8">Please login first to access admin tools.</main>;
  }

  if (!isAdmin) {
    return <main className="mx-auto max-w-5xl p-8">Only ADMIN users can access this page.</main>;
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-8">
      <header>
        <h1 className="text-3xl font-semibold">Admin Product Management</h1>
        <p className="mt-2 text-stone-700">Manage categories, products, uploads, and catalog content.</p>
      </header>

      {error && <p className="rounded-md bg-red-50 p-3 text-red-700">{error}</p>}
      {message && <p className="rounded-md bg-green-50 p-3 text-green-700">{message}</p>}

      <section className="rounded-lg border border-stone-200 bg-white p-5">
        <h2 className="text-xl font-semibold">Create Category</h2>
        <form onSubmit={onCreateCategory} className="mt-4 grid gap-3 md:grid-cols-4">
          <input
            className="rounded-md border border-stone-300 px-3 py-2"
            placeholder="Name"
            value={categoryForm.name}
            onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
          <input
            className="rounded-md border border-stone-300 px-3 py-2"
            placeholder="Slug"
            value={categoryForm.slug}
            onChange={(event) => setCategoryForm((prev) => ({ ...prev, slug: event.target.value }))}
            required
          />
          <input
            className="rounded-md border border-stone-300 px-3 py-2"
            placeholder="Description"
            value={categoryForm.description}
            onChange={(event) => setCategoryForm((prev) => ({ ...prev, description: event.target.value }))}
          />
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
              <button
                type="button"
                className="text-red-600 hover:underline"
                onClick={() => void onDeleteCategory(category.id)}
              >
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
            <input
              className="rounded-md border border-stone-300 px-3 py-2"
              placeholder="Title"
              value={productForm.title}
              onChange={(event) => setProductForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
            <input
              className="rounded-md border border-stone-300 px-3 py-2"
              placeholder="Slug"
              value={productForm.slug}
              onChange={(event) => setProductForm((prev) => ({ ...prev, slug: event.target.value }))}
              required
            />
            <input
              className="rounded-md border border-stone-300 px-3 py-2"
              placeholder="SKU"
              value={productForm.sku}
              onChange={(event) => setProductForm((prev) => ({ ...prev, sku: event.target.value }))}
              required
            />
          </div>

          <textarea
            className="min-h-28 w-full rounded-md border border-stone-300 px-3 py-2"
            placeholder="Description"
            value={productForm.description}
            onChange={(event) => setProductForm((prev) => ({ ...prev, description: event.target.value }))}
            required
          />

          <div className="grid gap-3 md:grid-cols-4">
            <input
              type="number"
              min={0}
              step="0.01"
              className="rounded-md border border-stone-300 px-3 py-2"
              placeholder="Price"
              value={productForm.price}
              onChange={(event) => setProductForm((prev) => ({ ...prev, price: event.target.value }))}
              required
            />
            <select
              className="rounded-md border border-stone-300 px-3 py-2"
              value={productForm.categoryId}
              onChange={(event) => setProductForm((prev) => ({ ...prev, categoryId: event.target.value }))}
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              className="rounded-md border border-stone-300 px-3 py-2"
              placeholder="Size"
              value={productForm.size}
              onChange={(event) => setProductForm((prev) => ({ ...prev, size: event.target.value }))}
            />
            <input
              className="rounded-md border border-stone-300 px-3 py-2"
              placeholder="Color"
              value={productForm.color}
              onChange={(event) => setProductForm((prev) => ({ ...prev, color: event.target.value }))}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="rounded-md border border-stone-300 px-3 py-2"
              placeholder="Material"
              value={productForm.material}
              onChange={(event) => setProductForm((prev) => ({ ...prev, material: event.target.value }))}
            />

            <label className="flex items-center gap-2 rounded-md border border-stone-300 px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={productForm.isActive}
                onChange={(event) => setProductForm((prev) => ({ ...prev, isActive: event.target.checked }))}
              />
              Product active
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Upload image</label>
            <input type="file" accept="image/*" onChange={(event) => void onUploadImage(event.target.files?.[0] ?? null)} />
          </div>

          <textarea
            className="min-h-24 w-full rounded-md border border-stone-300 px-3 py-2"
            placeholder="Image URLs (one per line)"
            value={productForm.imagesText}
            onChange={(event) => setProductForm((prev) => ({ ...prev, imagesText: event.target.value }))}
          />

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
                <p className="text-sm text-stone-600">{product.category.name} • {product.price.toFixed(2)} GEL</p>
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
            {product.images[0] && (
              <img src={product.images[0]} alt={product.title} className="mt-3 h-32 w-48 rounded-md border border-stone-200 object-cover" />
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
