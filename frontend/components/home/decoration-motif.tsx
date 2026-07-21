import Image from 'next/image';
import { stockImages } from '@/lib/stock-images';
import { cn } from '@/lib/cn';

export type MotifPlacement = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const CORNER_CLASS: Record<Exclude<MotifPlacement, 'center'>, string> = {
  'top-left': 'left-0 top-0 -translate-x-1/2 -translate-y-1/2',
  'top-right': 'right-0 top-0 translate-x-1/2 -translate-y-1/2',
  'bottom-left': 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
  'bottom-right': 'bottom-0 right-0 translate-x-1/2 translate-y-1/2'
};

/**
 * Soft watermark ornament inside text panels.
 * Corner placements pin the motif on the corner so only ~¼ shows.
 */
export function DecorationMotif({
  className,
  size = 'md',
  placement = 'center'
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  placement?: MotifPlacement;
}) {
  const dimensions = { sm: 160, md: 220, lg: 300 }[size];

  if (placement !== 'center') {
    return (
      <div
        className={cn('pointer-events-none absolute inset-0 z-0 overflow-hidden', className)}
        aria-hidden
      >
        <div className={cn('absolute', CORNER_CLASS[placement])}>
          <Image
            src={stockImages.decorationMotif}
            alt=""
            width={dimensions}
            height={dimensions}
            className="opacity-[0.14] brightness-0 dark:opacity-[0.2] dark:brightness-100"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden',
        className
      )}
      aria-hidden
    >
      <Image
        src={stockImages.decorationMotif}
        alt=""
        width={dimensions}
        height={dimensions}
        className="opacity-[0.09] brightness-0 sm:opacity-[0.11] dark:opacity-[0.14] dark:brightness-100"
      />
    </div>
  );
}
