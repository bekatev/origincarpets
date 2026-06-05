import { cn } from '@/lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-gradient-to-r from-[var(--oc-bg-secondary)] via-[var(--oc-line)]/40 to-[var(--oc-bg-secondary)]', className)} />;
}
