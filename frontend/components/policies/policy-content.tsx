'use client';

import type { PolicyBlock } from '@/lib/i18n-policies';

export function PolicyContent({
  title,
  lastUpdated,
  blocks
}: {
  title: string;
  lastUpdated?: string;
  blocks: readonly PolicyBlock[];
}) {
  return (
    <main className="oc-section">
      <div className="oc-container-narrow space-y-8">
        <header className="space-y-3 border-b border-[var(--oc-line)] pb-8">
          <h1 className="oc-heading-sm">{title}</h1>
          {lastUpdated ? <p className="text-sm text-[var(--oc-muted)]">{lastUpdated}</p> : null}
        </header>

        <div className="space-y-6 text-[15px] leading-8 text-[var(--oc-muted)]">
          {blocks.map((block, index) => {
            if (block.type === 'h2') {
              return (
                <h2
                  key={`${block.text}-${index}`}
                  className="pt-2 font-display text-lg uppercase tracking-[0.12em] text-[var(--oc-ink)]"
                >
                  {block.text}
                </h2>
              );
            }

            if (block.type === 'ul') {
              return (
                <ul key={`ul-${index}`} className="list-disc space-y-2 pl-5">
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
            }

            if (block.type === 'address') {
              return (
                <address
                  key={`addr-${index}`}
                  className="not-italic whitespace-pre-line rounded border border-[var(--oc-line)] bg-[var(--oc-bg-secondary)] px-5 py-4 text-sm leading-7 text-[var(--oc-ink)]"
                >
                  {block.lines.join('\n')}
                </address>
              );
            }

            return <p key={`p-${index}`}>{block.text}</p>;
          })}
        </div>
      </div>
    </main>
  );
}
