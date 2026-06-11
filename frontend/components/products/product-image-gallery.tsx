'use client';

import { useState } from 'react';

export function ProductImageGallery({
  images,
  title
}: {
  images: string[];
  title: string;
}) {
  const urls = images.filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeUrl = urls[activeIndex];

  if (!urls.length) {
    return (
      <div className="oc-surface flex min-h-[420px] items-center justify-center bg-[var(--oc-bg-secondary)] md:min-h-[520px]">
        <p className="text-sm text-[var(--oc-muted)]">No image</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="oc-surface relative overflow-hidden">
        <div className="relative flex min-h-[420px] w-full items-center justify-center bg-[var(--oc-bg-secondary)] md:min-h-[520px]">
          <img
            key={activeUrl}
            src={activeUrl}
            alt={`${title} — image ${activeIndex + 1} of ${urls.length}`}
            loading={activeIndex === 0 ? 'eager' : 'lazy'}
            decoding="async"
            className="h-auto max-h-[70vh] w-full object-contain"
          />
        </div>
        {urls.length > 1 && (
          <p className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1 text-xs uppercase tracking-wider text-white backdrop-blur-sm">
            {activeIndex + 1} / {urls.length}
          </p>
        )}
      </div>

      {urls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {urls.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={index === activeIndex}
              className={`relative h-20 w-20 shrink-0 overflow-hidden border-2 transition duration-300 ease-luxury md:h-24 md:w-24 ${
                index === activeIndex
                  ? 'border-[var(--oc-brand)] opacity-100 ring-2 ring-[var(--oc-brand)] ring-offset-2'
                  : 'border-[var(--oc-line)] opacity-70 hover:opacity-100'
              }`}
            >
              <img src={url} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
