import GE from 'country-flag-icons/react/3x2/GE';
import EU from 'country-flag-icons/react/3x2/EU';
import US from 'country-flag-icons/react/3x2/US';
import { cn } from '@/lib/cn';
import type { DisplayCurrency } from '@/lib/currency';

function FlagGraphic({ currency }: { currency: DisplayCurrency }) {
  switch (currency) {
    case 'USD':
      return <US className="h-full w-full" />;
    case 'EUR':
      return <EU className="h-full w-full" />;
    case 'GEL':
      return <GE className="h-full w-full" />;
  }
}

type CurrencyFlagIconProps = {
  currency: DisplayCurrency;
  className?: string;
  size?: 'sm' | 'md';
};

const sizes = {
  sm: 'h-[10px] w-[15px]',
  md: 'h-[11px] w-[16.5px]'
} as const;

export function CurrencyFlagIcon({ currency, className, size = 'md' }: CurrencyFlagIconProps) {
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
      <FlagGraphic currency={currency} />
    </span>
  );
}
