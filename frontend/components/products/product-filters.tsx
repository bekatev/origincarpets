import type { ProductCategory } from '@/lib/products';

export function ProductFilters({
  categories,
  current
}: {
  categories: ProductCategory[];
  current: { search?: string; category?: string; minPrice?: string; maxPrice?: string };
}) {
  return (
    <form className="oc-surface grid gap-3 p-4 md:grid-cols-4" method="get">
      <input
        name="search"
        defaultValue={current.search}
        placeholder="Search carpets"
        className="oc-input"
      />

      <select name="category" defaultValue={current.category ?? ''} className="oc-input">
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
        className="oc-input"
      />

      <div className="flex gap-2">
        <input
          type="number"
          min={0}
          name="maxPrice"
          defaultValue={current.maxPrice}
          placeholder="Max price"
          className="oc-input"
        />
        <button type="submit" className="oc-btn-primary px-4">
          Apply
        </button>
      </div>
    </form>
  );
}
