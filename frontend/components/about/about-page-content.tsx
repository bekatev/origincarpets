'use client';

import type { ReactNode } from 'react';
import { CarpetBackdrop } from '@/components/home/carpet-backdrop';
import { DecorationDivider } from '@/components/home/decoration-divider';
import { DecorationMotif, type MotifPlacement } from '@/components/home/decoration-motif';
import { ParallaxContent } from '@/components/motion/parallax-media';
import { useI18n } from '@/components/providers/i18n-provider';
import { aboutMediaItems, facebookEmbedSrc } from '@/lib/about-media';
import { stockImages } from '@/lib/stock-images';

const carpetCycle = [
  stockImages.carpets.column,
  stockImages.carpets.jewel,
  stockImages.carpets.layered,
  stockImages.carpets.heroCarpet,
  stockImages.carpets.border,
  stockImages.carpets.lions,
  stockImages.carpets.rust,
  stockImages.carpets.navy
] as const;

function TextPanel({
  children,
  className = '',
  motif = false,
  motifSize = 'md',
  motifPlacement = 'center'
}: {
  children: ReactNode;
  className?: string;
  motif?: boolean;
  motifSize?: 'sm' | 'md' | 'lg';
  motifPlacement?: MotifPlacement;
}) {
  return (
    <div
      className={`relative isolate overflow-hidden bg-[var(--oc-paper)] p-8 text-[var(--oc-ink)] sm:p-10 lg:p-12 ${className}`}
    >
      {motif ? <DecorationMotif size={motifSize} placement={motifPlacement} /> : null}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function AboutPageContent() {
  const { dict, locale } = useI18n();
  const copy = dict.aboutPage;

  return (
    <main>
      <section className="relative oc-section overflow-hidden">
        <CarpetBackdrop
          src={stockImages.carpets.column}
          tone="paper"
          strength={0.28}
          rotate={90}
          zoom={1.06}
          intensity={95}
        />
        <ParallaxContent intensity={28} className="oc-container">
          <TextPanel motif motifSize="md" motifPlacement="bottom-right" className="mx-auto max-w-3xl text-center">
            <p className="oc-eyebrow">{copy.eyebrow}</p>
            <h1 className="oc-heading-sm mt-4">{copy.title}</h1>
            <p className="oc-body mx-auto mt-6 max-w-2xl text-[var(--oc-ink)]/90 sm:text-base">{copy.lead}</p>
          </TextPanel>
        </ParallaxContent>
      </section>

      {aboutMediaItems.map((item, index) => {
        const carpet = carpetCycle[index % carpetCycle.length];
        const rotate = index % 3 === 0 ? 90 : 0;

        return (
          <div key={item.id}>
            <DecorationDivider />
            <section className="relative oc-section overflow-hidden">
              <CarpetBackdrop
                src={carpet}
                tone="paper"
                strength={0.28}
                rotate={rotate}
                zoom={rotate ? 1.06 : 1.12}
                intensity={90 + (index % 3) * 8}
              />
              <ParallaxContent intensity={24} className="oc-container">
                <div className="mx-auto flex max-w-xl flex-col items-center">
                  {item.kind === 'facebook' ? (
                    <div className="w-full overflow-hidden bg-[var(--oc-paper)] shadow-[var(--oc-shadow-lift)]">
                      <iframe
                        title={`${copy.facebookEmbedLabel} ${index + 1}`}
                        src={facebookEmbedSrc(item.href)}
                        width="380"
                        height="680"
                        className="mx-auto block h-[min(680px,82vh)] w-full max-w-[380px] border-0"
                        style={{ border: 'none', overflow: 'hidden' }}
                        scrolling="no"
                        allowFullScreen
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        loading="lazy"
                      />
                      <div className="border-t border-[var(--oc-line)] px-5 py-4 text-center">
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="oc-link oc-link-arrow inline-flex text-sm"
                        >
                          {copy.openOnFacebook}
                        </a>
                      </div>
                    </div>
                  ) : (
                    <TextPanel motif motifSize="sm" motifPlacement="top-left" className="w-full text-center">
                      <p className="oc-eyebrow">{copy.tvEyebrow}</p>
                      <h2 className="oc-heading-sm mt-4 text-2xl sm:text-3xl">
                        {locale === 'ka' ? item.titleKa : item.titleEn}
                      </h2>
                      <p className="oc-body mx-auto mt-5 max-w-md">{copy.tvBody}</p>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="oc-link oc-link-arrow mt-8 inline-flex"
                      >
                        {copy.watchOnAdjara}
                      </a>
                    </TextPanel>
                  )}
                </div>
              </ParallaxContent>
            </section>
          </div>
        );
      })}

      <DecorationDivider />
    </main>
  );
}
