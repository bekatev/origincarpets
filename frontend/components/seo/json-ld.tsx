type JsonLdValue = Record<string, unknown> | Array<Record<string, unknown>>;

/** Server-safe JSON-LD script tag for Google rich results. */
export function JsonLd({ data }: { data: JsonLdValue }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD must be raw JSON in the document.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
