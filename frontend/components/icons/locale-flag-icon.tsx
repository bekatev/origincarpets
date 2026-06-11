import GB from 'country-flag-icons/react/3x2/GB';
import GE from 'country-flag-icons/react/3x2/GE';
import { cn } from '@/lib/cn';
import type { Locale } from '@/lib/i18n';

function FlagGraphic({ locale }: { locale: Locale }) {
  return locale === 'ka' ? <GE className="h-full w-full" /> : <GB className="h-full w-full" />;
}

type LocaleFlagIconProps = {
  locale: Locale;
  className?: string;
  size?: 'sm' | 'md';
};

const sizes = {
  sm: 'h-[10px] w-[15px]',
  md: 'h-[11px] w-[16.5px]'
} as const;

export function LocaleFlagIcon({ locale, className, size = 'md' }: LocaleFlagIconProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 overflow-hidden rounded-[2px] ring-1 ring-[var(--oc-line)]',
        'shadow-[0_1px_2px_rgba(26,26,26,0.06)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.35)]',
        sizes[size],
        className
      )}
      aria-hidden
    >
      <FlagGraphic locale={locale} />
    </span>
  );
}
