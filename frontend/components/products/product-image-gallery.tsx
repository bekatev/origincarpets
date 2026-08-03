'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '@/components/providers/i18n-provider';
import { cn } from '@/lib/cn';

/** Very light beige — soft contrast for carpets in light and dark theme. */
const FRAME_BG = '#f4ebe0';

/** How much larger the hover preview shows vs the lens area. */
const HOVER_ZOOM = 2.75;

type ImageBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function containedImageBox(
  containerW: number,
  containerH: number,
  naturalW: number,
  naturalH: number
): ImageBox {
  if (!naturalW || !naturalH || !containerW || !containerH) {
    return { left: 0, top: 0, width: containerW, height: containerH };
  }
  const containerRatio = containerW / containerH;
  const imageRatio = naturalW / naturalH;
  if (imageRatio > containerRatio) {
    const width = containerW;
    const height = containerW / imageRatio;
    return { left: 0, top: (containerH - height) / 2, width, height };
  }
  const height = containerH;
  const width = containerH * imageRatio;
  return { left: (containerW - width) / 2, top: 0, width, height };
}

export function ProductImageGallery({
  images,
  title,
  badge
}: {
  images: string[];
  title: string;
  badge?: ReactNode;
}) {
  const { dict } = useI18n();
  const d = dict.productDetail;
  const urls = images.filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeUrl = urls[activeIndex];

  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [hovering, setHovering] = useState(false);
  const [canHover, setCanHover] = useState(false);
  const [lens, setLens] = useState({ x: 0, y: 0, w: 120, h: 120 });
  const [ratio, setRatio] = useState({ x: 0.5, y: 0.5 });
  const [preview, setPreview] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setCanHover(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const updateNatural = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.naturalWidth && img.naturalHeight) {
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    }
  }, []);

  useEffect(() => {
    setHovering(false);
    setNatural({ w: 0, h: 0 });
  }, [activeUrl]);

  const placePreview = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const gap = 16;
    const width = Math.min(rect.width, window.innerWidth - rect.right - gap - 16);
    // Prefer a panel to the right of the gallery (over product details).
    if (width >= 220) {
      setPreview({
        top: rect.top,
        left: rect.right + gap,
        width,
        height: rect.height
      });
      return;
    }
    // Narrow screens with hover (rare): panel below.
    setPreview({
      top: rect.bottom + gap,
      left: rect.left,
      width: rect.width,
      height: Math.min(rect.height, window.innerHeight - rect.bottom - gap - 16)
    });
  }, []);

  const onMove = useCallback(
    (clientX: number, clientY: number) => {
      const stage = stageRef.current;
      const img = imgRef.current;
      if (!stage || !img) return;

      const stageRect = stage.getBoundingClientRect();
      const box = containedImageBox(stageRect.width, stageRect.height, natural.w || img.naturalWidth, natural.h || img.naturalHeight);

      const previewH = preview?.height ?? stageRect.height;
      const previewW = preview?.width ?? stageRect.width;
      const lensW = Math.min(box.width, previewW / HOVER_ZOOM);
      const lensH = Math.min(box.height, previewH / HOVER_ZOOM);

      const localX = clientX - stageRect.left - box.left;
      const localY = clientY - stageRect.top - box.top;
      const clampedX = Math.min(Math.max(localX, lensW / 2), box.width - lensW / 2);
      const clampedY = Math.min(Math.max(localY, lensH / 2), box.height - lensH / 2);

      setLens({
        x: box.left + clampedX - lensW / 2,
        y: box.top + clampedY - lensH / 2,
        w: lensW,
        h: lensH
      });
      setRatio({
        x: box.width ? clampedX / box.width : 0.5,
        y: box.height ? clampedY / box.height : 0.5
      });
    },
    [natural.h, natural.w, preview?.height, preview?.width]
  );

  const onMouseEnter = () => {
    if (!canHover) return;
    placePreview();
    setHovering(true);
  };

  const onMouseLeave = () => {
    setHovering(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!canHover) return;
    if (!hovering) {
      placePreview();
      setHovering(true);
    }
    onMove(e.clientX, e.clientY);
  };

  useEffect(() => {
    if (!hovering) return;
    const onResize = () => placePreview();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [hovering, placePreview]);

  if (!urls.length) {
    return (
      <div
        className="oc-surface relative flex min-h-[420px] items-center justify-center md:min-h-[520px]"
        style={{ backgroundColor: FRAME_BG }}
      >
        {badge}
        <p className="text-sm text-[var(--oc-muted)]">No image</p>
      </div>
    );
  }

  const bgSizeX = `${HOVER_ZOOM * 100}%`;
  const bgPosX = `${ratio.x * 100}%`;
  const bgPosY = `${ratio.y * 100}%`;

  return (
    <div className="space-y-4">
      <div className="oc-surface relative overflow-visible">
        {badge}
        <div
          ref={stageRef}
          role="img"
          aria-label={`${title} — ${d.zoomHint}`}
          className={cn(
            'relative flex min-h-[420px] w-full items-center justify-center md:min-h-[520px]',
            canHover ? 'cursor-crosshair' : ''
          )}
          style={{ backgroundColor: FRAME_BG }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onMouseMove={onMouseMove}
        >
          <img
            ref={imgRef}
            key={activeUrl}
            src={activeUrl}
            alt={`${title} — image ${activeIndex + 1} of ${urls.length}`}
            loading={activeIndex === 0 ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={updateNatural}
            className="h-auto max-h-[70vh] w-full object-contain"
            draggable={false}
          />

          {canHover && hovering ? (
            <div
              aria-hidden
              className="pointer-events-none absolute z-10 border border-[var(--oc-ink)]/35 bg-white/15 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)] backdrop-blur-[1px]"
              style={{
                left: lens.x,
                top: lens.y,
                width: lens.w,
                height: lens.h
              }}
            />
          ) : null}

          {canHover ? (
            <span className="pointer-events-none absolute bottom-3 left-3 z-10 inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white backdrop-blur-sm">
              <ZoomIcon />
              {d.zoomHint}
            </span>
          ) : null}

          {urls.length > 1 && (
            <p className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-full bg-black/50 px-3 py-1 text-xs uppercase tracking-wider text-white backdrop-blur-sm">
              {activeIndex + 1} / {urls.length}
            </p>
          )}
        </div>
      </div>

      {urls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {urls.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={index === activeIndex}
              className={cn(
                'relative h-20 w-20 shrink-0 overflow-hidden border-2 transition duration-300 ease-luxury md:h-24 md:w-24',
                index === activeIndex
                  ? 'border-[var(--oc-brand)] opacity-100 ring-2 ring-[var(--oc-brand)] ring-offset-2'
                  : 'border-[var(--oc-line)] opacity-70 hover:opacity-100'
              )}
              style={{ backgroundColor: FRAME_BG }}
            >
              <img src={url} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}

      {canHover && hovering && preview && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="pointer-events-none fixed z-[70] overflow-hidden border border-[var(--oc-line)] shadow-[var(--oc-shadow-lift)]"
              style={{
                top: preview.top,
                left: preview.left,
                width: preview.width,
                height: preview.height,
                backgroundColor: FRAME_BG
              }}
              aria-hidden
            >
              <div
                className="h-full w-full"
                style={{
                  backgroundImage: `url(${activeUrl})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: bgSizeX,
                  backgroundPosition: `${bgPosX} ${bgPosY}`
                }}
              />
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

function ZoomIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M11 8v6M8 11h6M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}
