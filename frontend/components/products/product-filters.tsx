import type { ProductCategory } from '@/lib/products';

export function ProductFilters({
  categories,
  current
}: {
  categories: ProductCategory[];
  current: { search?: string; category?: string; minPrice?: string; maxPrice?: string };
}) {
  return (
    <form className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 md:grid-cols-4" method="get">
      <input
        name="search"
        defaultValue={current.search}
        placeholder="Search carpets"
        className="rounded-md border border-stone-300 px-3 py-2"
      />

      <select name="category" defaultValue={current.category ?? ''} className="rounded-md border border-stone-300 px-3 py-2">
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        min={0}
        name="minPrice"
        defaultValue={current.minPrice}
        placeholder="Min price"
        className="rounded-md border border-stone-300 px-3 py-2"
      />

      <div className="flex gap-2">
        <input
          type="number"
          min={0}
          name="maxPrice"
          defaultValue={current.maxPrice}
          placeholder="Max price"
          className="w-full rounded-md border border-stone-300 px-3 py-2"
        />
        <button type="submit" className="rounded-md bg-brand-700 px-4 py-2 text-white">
          Apply
        </button>
      </div>
    </form>
  );
}
