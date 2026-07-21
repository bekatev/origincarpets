import Image from 'next/image';
import { cn } from '@/lib/cn';

type Tone = 'paper' | 'ink';

/**
 * Carpet fills the section; a scrim keeps copy readable.
 * `zoom` crops studio black edges; `rotate` turns the rug (e.g. 90 for landscape sections).
 */
export function CarpetBackdrop({
  src,
  className,
  tone = 'paper',
  strength = 0.55,
  position = 'center',
  zoom = 1,
  rotate = 0
}: {
  src: string;
  className?: string;
  tone?: Tone;
  strength?: number;
  position?: string;
  zoom?: number;
  rotate?: number;
}) {
  const needsTransform = rotate !== 0 || zoom !== 1;

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      {rotate === 90 || rotate === -90 ? (
        // Swap axes so a portrait rug can fill a wide section without extreme crop
        <div
          className="absolute left-1/2 top-1/2 h-[max(100%,100vw)] w-[max(100%,100vh)]"
          style={{
            transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${zoom})`,
            transformOrigin: 'center center'
          }}
        >
          <Image src={src} alt="" fill className="object-cover object-center" sizes="100vw" />
        </div>
      ) : (
        <Image
          src={src}
          alt=""
          fill
          className="object-cover"
          style={{
            objectPosition: position,
            transform: needsTransform ? `rotate(${rotate}deg) scale(${zoom})` : undefined,
            transformOrigin: 'center center'
          }}
          sizes="100vw"
        />
      )}
      {tone === 'ink' && strength > 0 ? (
        <div className="absolute inset-0 bg-[#1a1210]" style={{ opacity: strength }} />
      ) : null}
      {tone === 'paper' && strength > 0 ? (
        <div className="absolute inset-0 bg-[var(--oc-bg)]" style={{ opacity: strength }} />
      ) : null}
    </div>
  );
}

export function CarpetRibbon({
  src,
  className,
  zoom = 1.35
}: {
  src: string;
  className?: string;
  zoom?: number;
}) {
  return (
    <div
      className={cn(
        'relative left-1/2 h-14 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden sm:h-16',
        className
      )}
      aria-hidden
    >
      <Image
        src={src}
        alt=""
        fill
        className="object-cover object-center"
        style={{ transform: zoom !== 1 ? `scale(${zoom})` : undefined }}
        sizes="100vw"
      />
    </div>
  );
}
