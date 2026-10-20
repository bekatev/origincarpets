import { fetchProducts, type ProductItem } from '@/lib/products';
import { SITE_NAME, absoluteImageUrl, absoluteUrl } from '@/lib/seo';
import { toPlainText } from '@/lib/text';

/**
 * Product feed for Meta Commerce Manager (catalog ads) and Google Merchant Center
 * (Shopping / Performance Max). RSS 2.0 with the Google `g:` namespace, which both accept.
 * `g:id` is the product slug so it matches the content_ids sent by Pixel / GA events.
 */

export const revalidate = 900;

const GOOGLE_CATEGORY = 'Home & Garden > Decor > Rugs';
/** Merchant Center condition — change to "used" if the catalog is mostly antique pre-owned pieces. */
const CONDITION = 'new';
const MAX_PAGES = 50;

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    // Strip control characters that make the XML invalid.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
}

function tag(name: string, value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  return `<${name}>${xmlEscape(String(value))}</${name}>`;
}

function money(amount: number): string {
  return `${amount.toFixed(2)} USD`;
}

async function fetchAllProducts(): Promise<ProductItem[]> {
  const all: ProductItem[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = await fetchProducts({ limit: '100', page: String(page) });
    all.push(...result.items);
    if (page >= result.meta.pages || !result.items.length) break;
  }
  return all;
}

function capitalize(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

/**
 * Most admin titles are just "Carpet" / "Kilim", which makes dozens of identical ads.
 * Append origin, age, material and dimensions so each catalog item is distinguishable.
 */
function feedTitle(product: ProductItem): string {
  const base = capitalize((product.localizations?.title?.en || product.title).trim());
  const lower = base.toLowerCase();
  const parts: string[] = [];

  const origin = product.origin?.trim();
  if (origin && !lower.includes(origin.split(',')[0].trim().toLowerCase())) {
    parts.push(origin);
  }
  const age = (product.attributes.age || product.attributes.period)?.trim();
  if (age && !lower.includes(age.toLowerCase())) parts.push(age);
  const material = product.attributes.material?.trim();
  if (material && !lower.includes(material.toLowerCase())) parts.push(material);

  const { widthCm, lengthCm } = product.shipping ?? {};
  if (widthCm && lengthCm) parts.push(`${widthCm}×${lengthCm} cm`);

  return (parts.length ? `${base} – ${parts.join(' · ')}` : base).slice(0, 150);
}

function itemXml(product: ProductItem): string {
  const title = feedTitle(product);
  const description =
    toPlainText(product.localizations?.description?.en || product.description).trim().slice(0, 5000) || title;
  const images = product.images.map(absoluteImageUrl);
  const onSale = product.compareAtPrice != null && product.compareAtPrice > product.price;

  return [
    '<item>',
    tag('g:id', product.slug),
    tag('g:title', title),
    tag('g:description', description),
    tag('g:link', absoluteUrl(`/products/${product.slug}`)),
    tag('g:image_link', images[0]),
    ...images.slice(1, 11).map((url) => tag('g:additional_image_link', url)),
    tag('g:availability', product.isSold ? 'out of stock' : 'in stock'),
    tag('g:price', money(onSale ? product.compareAtPrice! : product.price)),
    onSale ? tag('g:sale_price', money(product.price)) : '',
    tag('g:brand', SITE_NAME),
    tag('g:condition', CONDITION),
    tag('g:identifier_exists', 'no'),
    tag('g:mpn', product.sku),
    tag('g:google_product_category', GOOGLE_CATEGORY),
    tag('g:product_type', product.category?.name),
    tag('g:material', product.attributes.material),
    tag('g:color', product.attributes.color),
    tag('g:size', product.attributes.size),
    product.shipping?.weightKg != null ? tag('g:shipping_weight', `${product.shipping.weightKg} kg`) : '',
    tag('g:custom_label_0', product.category?.slug),
    tag('g:custom_label_1', product.origin),
    tag('g:custom_label_2', onSale ? 'sale' : 'regular'),
    '</item>'
  ]
    .filter(Boolean)
    .join('');
}

export async function GET() {
  const products = (await fetchAllProducts()).filter((product) => product.images.length > 0);

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    '<channel>',
    tag('title', SITE_NAME),
    tag('link', absoluteUrl('/')),
    tag('description', `${SITE_NAME} product feed`),
    ...products.map(itemXml),
    '</channel>',
    '</rss>'
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=900, s-maxage=900'
    }
  });
}
