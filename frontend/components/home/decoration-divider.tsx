export function DecorationDivider({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative left-1/2 h-9 w-screen max-w-[100vw] -translate-x-1/2 bg-[url('/brand/decoration-line.png')] bg-repeat-x bg-[length:auto_100%] bg-center opacity-90 sm:h-10 ${className}`}
      aria-hidden
    />
  );
}
