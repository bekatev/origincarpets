import Image from 'next/image';
import { cn } from '@/lib/cn';

type IconProps = {
  className?: string;
};

export function VisaIcon({ className }: IconProps) {
  return (
    <Image
      src="/brand/visa.png"
      alt="Visa"
      width={48}
      height={34}
      className={cn('h-7 w-auto', className)}
    />
  );
}

export function MastercardIcon({ className }: IconProps) {
  return (
    <Image
      src="/brand/mastercard.png"
      alt="Mastercard"
      width={48}
      height={34}
      className={cn('h-7 w-auto', className)}
    />
  );
}
