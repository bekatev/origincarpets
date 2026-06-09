import { stockImages } from '@/lib/stock-images';

export function DecorationDivider({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative left-1/2 h-8 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden sm:h-10 ${className}`}
      aria-hidden
    >
      <div
        className="h-full w-full bg-repeat-x bg-[length:auto_100%] bg-center opacity-95 dark:opacity-80"
        style={{ backgroundImage: `url('${stockImages.decorationLine}')` }}
      />
    </div>
  );
}
