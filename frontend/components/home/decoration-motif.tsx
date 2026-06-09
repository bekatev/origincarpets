import Image from 'next/image';
import { stockImages } from '@/lib/stock-images';
import { cn } from '@/lib/cn';

export function DecorationMotif({
  className,
  size = 'md'
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const dimensions = { sm: 120, md: 180, lg: 240 }[size];

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden',
        className
      )}
      aria-hidden
    >
      <Image
        src={stockImages.decorationMotif}
        alt=""
        width={dimensions}
        height={dimensions}
        className="opacity-[0.06] dark:opacity-[0.08]"
      />
    </div>
  );
}
