import Image from 'next/image';
import { cn } from '@/lib/cn';

type BrandLogoProps = {
  className?: string;
  iconClassName?: string;
  /** Overall height class for the icon (text scales with it). */
  size?: 'sm' | 'md' | 'lg';
  /** Icon mark only (e.g. compact mobile header). */
  iconOnly?: boolean;
};

const iconSizes = {
  sm: { px: 32, className: 'h-8 w-8' },
  md: { px: 40, className: 'h-9 w-9 sm:h-10 sm:w-10' },
  lg: { px: 48, className: 'h-11 w-11 sm:h-12 sm:w-12' }
} as const;

const textSizes = {
  sm: 'text-[0.6rem] sm:text-[0.625rem]',
  md: 'text-[0.625rem] sm:text-[0.6875rem]',
  lg: 'text-[0.6875rem] sm:text-[0.75rem]'
} as const;

/** Icon + wordmark; wordmark is black in light mode, white in dark mode. */
export function BrandLogo({ className, iconClassName, size = 'md', iconOnly = false }: BrandLogoProps) {
  const icon = iconSizes[size];

  if (iconOnly) {
    return (
      <Image
        src="/brand/logo-icon.png"
        alt="Origin Carpets"
        width={icon.px}
        height={icon.px}
        className={cn(icon.className, 'object-contain', iconClassName, className)}
      />
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-2.5 sm:gap-3', className)}>
      <Image
        src="/brand/logo-icon.png"
        alt=""
        width={icon.px}
        height={icon.px}
        className={cn(icon.className, 'shrink-0 object-contain', iconClassName)}
        aria-hidden
      />
      <span
        className={cn(
          'flex flex-col border-l border-[#1a1a1a] pl-2.5 font-sans uppercase leading-[1.15] sm:pl-3',
          textSizes[size]
        )}
      >
        <span className="font-bold tracking-[0.04em] text-[#1a1a1a] dark:text-white">Origin</span>
        <span className="font-light tracking-[0.14em] text-[#1a1a1a] dark:text-white">Carpets</span>
      </span>
    </span>
  );
}
