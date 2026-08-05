import Image from 'next/image';
import { stockImages } from '@/lib/stock-images';
import { cn } from '@/lib/cn';

export type MotifPlacement =
  | 'center'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'left'
  | 'right'
  | 'bottom';

const SIZE_PX = { xs: 72, sm: 160, md: 240, lg: 340, xl: 480, hero: 640 } as const;

/** Corner: pin center on the corner so ~¼ of the ornament shows. */
const CORNER_CLASS: Record<
  'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
  string
> = {
  'top-left': 'left-0 top-0 -translate-x-1/2 -translate-y-1/2',
  'top-right': 'right-0 top-0 translate-x-1/2 -translate-y-1/2',
  'bottom-left': 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
  'bottom-right': 'bottom-0 right-0 translate-x-1/2 translate-y-1/2'
};

/** Edge: show roughly half the ornament peeking in. */
const EDGE_CLASS: Record<'left' | 'right' | 'bottom', string> = {
  left: 'left-0 top-1/2 -translate-x-[42%] -translate-y-1/2',
  right: 'right-0 top-1/2 translate-x-[42%] -translate-y-1/2',
  bottom: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-[45%]'
};

function defaultOpacityClass(placement: MotifPlacement): string {
  if (placement === 'center') {
    return 'opacity-[0.22] sm:opacity-[0.26] dark:opacity-[0.2]';
  }
  if (placement === 'left' || placement === 'right' || placement === 'bottom') {
    return 'opacity-[0.24] sm:opacity-[0.28] dark:opacity-[0.22]';
  }
  return 'opacity-[0.26] sm:opacity-[0.3] dark:opacity-[0.24]';
}

/**
 * Soft watermark ornament for solid paper/sand panels.
 * Renders the source PNG as-is so lace cutouts and tonal layers stay intact.
 */
export function DecorationMotif({
  className,
  size = 'md',
  placement = 'center',
  opacity
}: {
  className?: string;
  size?: keyof typeof SIZE_PX;
  placement?: MotifPlacement;
  /** Override default opacity (0–1). */
  opacity?: number;
}) {
  const dimensions = SIZE_PX[size];

  const motif = (
    <Image
      src={stockImages.decorationMotif}
      alt=""
      width={dimensions}
      height={dimensions}
      unoptimized
      className={cn(opacity == null && defaultOpacityClass(placement))}
      style={opacity != null ? { opacity } : undefined}
    />
  );

  if (placement === 'center') {
    return (
      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden',
          className
        )}
        aria-hidden
      >
        {motif}
      </div>
    );
  }

  const isEdge = placement === 'left' || placement === 'right' || placement === 'bottom';
  const posClass = isEdge ? EDGE_CLASS[placement] : CORNER_CLASS[placement];

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 z-0 overflow-hidden', className)}
      aria-hidden
    >
      <div className={cn('absolute', posClass)}>{motif}</div>
    </div>
  );
}
