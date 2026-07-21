import { stockImages } from '@/lib/stock-images';

/**
 * Full-bleed decorative strip — one continuous image edge-to-edge.
 * Never tiled: repeating left visible gaps at tile seams.
 */
export function DecorationDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`relative h-8 w-full overflow-hidden sm:h-10 ${className}`} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={stockImages.decorationLine}
        alt=""
        className="pointer-events-none block h-full w-full max-w-none object-fill"
        draggable={false}
      />
    </div>
  );
}
