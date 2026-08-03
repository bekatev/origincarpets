'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useI18n } from '@/components/providers/i18n-provider';
import { cn } from '@/lib/cn';

/** Fit = 1. High ceiling so weave / knots can be inspected. */
const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const WHEEL_ZOOM_FACTOR = 0.0022;
const PINCH_ZOOM_FACTOR = 0.012;
const CLICK_ZOOM = 3;

/** Very light beige — soft contrast for carpets in light and dark theme. */
const FRAME_BG = '#f4ebe0';

const ZOOM_PRESETS = [1, 2, 3, 5] as const;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const activeUrl = urls[activeIndex];

  const openLightbox = useCallback(() => {
    if (!urls.length) return;
    setLightboxOpen(true);
  }, [urls.length]);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

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

  return (
    <div className="space-y-4">
      <div className="oc-surface relative overflow-hidden">
        {badge}
        <button
          type="button"
          onClick={openLightbox}
          aria-label={d.zoomOpen}
          className="group relative flex min-h-[420px] w-full cursor-zoom-in items-center justify-center md:min-h-[520px]"
          style={{ backgroundColor: FRAME_BG }}
        >
          <img
            key={activeUrl}
            src={activeUrl}
            alt={`${title} — image ${activeIndex + 1} of ${urls.length}`}
            loading={activeIndex === 0 ? 'eager' : 'lazy'}
            decoding="async"
            className="h-auto max-h-[70vh] w-full object-contain transition duration-500 ease-luxury group-hover:scale-[1.01]"
            draggable={false}
          />
          <span className="pointer-events-none absolute bottom-3 left-3 z-10 inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white opacity-90 backdrop-blur-sm transition group-hover:opacity-100">
            <ZoomIcon />
            {d.zoomHint}
          </span>
        </button>
        {urls.length > 1 && (
          <p className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-full bg-black/50 px-3 py-1 text-xs uppercase tracking-wider text-white backdrop-blur-sm">
            {activeIndex + 1} / {urls.length}
          </p>
        )}
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

      <Lightbox
        open={lightboxOpen}
        urls={urls}
        title={title}
        index={activeIndex}
        onIndexChange={setActiveIndex}
        onClose={closeLightbox}
        labels={{
          close: d.zoomClose,
          prev: d.zoomPrev,
          next: d.zoomNext,
          zoomIn: d.zoomIn,
          zoomOut: d.zoomOut,
          reset: d.zoomReset,
          hint: d.zoomInspectHint
        }}
      />
    </div>
  );
}

function Lightbox({
  open,
  urls,
  title,
  index,
  onIndexChange,
  onClose,
  labels
}: {
  open: boolean;
  urls: string[];
  title: string;
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  labels: {
    close: string;
    prev: string;
    next: string;
    zoomIn: string;
    zoomOut: string;
    reset: string;
    hint: string;
  };
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [pinching, setPinching] = useState(false);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const movedRef = useRef(false);
  const zoomRef = useRef(zoom);
  const offsetRef = useRef(offset);
  const url = urls[index];

  zoomRef.current = zoom;
  offsetRef.current = offset;

  const resetView = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  /** Zoom toward a point in the stage (client coords). Keeps that spot under the cursor. */
  const zoomToward = useCallback((clientX: number, clientY: number, nextZoom: number) => {
    const stage = stageRef.current;
    if (!stage) {
      setZoom(nextZoom);
      return;
    }
    const z = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
    const prev = zoomRef.current;
    if (z === prev) return;

    const rect = stage.getBoundingClientRect();
    const cx = clientX - rect.left - rect.width / 2;
    const cy = clientY - rect.top - rect.height / 2;
    const { x: ox, y: oy } = offsetRef.current;
    const ratio = z / prev;

    setZoom(z);
    if (z <= MIN_ZOOM) {
      setOffset({ x: 0, y: 0 });
      return;
    }
    setOffset({
      x: cx - (cx - ox) * ratio,
      y: cy - (cy - oy) * ratio
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    resetView();
  }, [open, index, resetView]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && urls.length > 1) {
        onIndexChange((index - 1 + urls.length) % urls.length);
      }
      if (e.key === 'ArrowRight' && urls.length > 1) {
        onIndexChange((index + 1) % urls.length);
      }
      if (e.key === '+' || e.key === '=') {
        const stage = stageRef.current?.getBoundingClientRect();
        if (stage) {
          zoomToward(stage.left + stage.width / 2, stage.top + stage.height / 2, zoomRef.current * 1.35);
        }
      }
      if (e.key === '-' || e.key === '_') {
        const stage = stageRef.current?.getBoundingClientRect();
        if (stage) {
          zoomToward(stage.left + stage.width / 2, stage.top + stage.height / 2, zoomRef.current / 1.35);
        }
      }
      if (e.key === '0') resetView();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, index, urls.length, onClose, onIndexChange, resetView, zoomToward]);

  // Native wheel listener — need passive:false to prevent page scroll while zooming.
  useEffect(() => {
    if (!open) return;
    const stage = stageRef.current;
    if (!stage) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * WHEEL_ZOOM_FACTOR);
      zoomToward(e.clientX, e.clientY, zoomRef.current * factor);
    };

    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [open, zoomToward]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    movedRef.current = false;

    if (pointersRef.current.size === 2) {
      const pts = [...pointersRef.current.values()];
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      pinchRef.current = { distance: Math.hypot(dx, dy), zoom: zoomRef.current };
      dragRef.current = null;
      setDragging(false);
      setPinching(true);
      return;
    }

    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      ox: offsetRef.current.x,
      oy: offsetRef.current.y
    };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 2 && pinchRef.current) {
      const pts = [...pointersRef.current.values()];
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      const distance = Math.hypot(dx, dy);
      const midX = (pts[0].x + pts[1].x) / 2;
      const midY = (pts[0].y + pts[1].y) / 2;
      const ratio = distance / Math.max(pinchRef.current.distance, 1);
      const next = pinchRef.current.zoom * Math.pow(ratio, 1 + PINCH_ZOOM_FACTOR);
      zoomToward(midX, midY, next);
      movedRef.current = true;
      return;
    }

    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) movedRef.current = true;

    // Always allow pan (even at 1x a bit) — when zoomed it's essential.
    if (zoomRef.current > MIN_ZOOM) {
      setOffset({ x: drag.ox + dx, y: drag.oy + dy });
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) {
      pinchRef.current = null;
      setPinching(false);
    }
    if (pointersRef.current.size === 0) {
      dragRef.current = null;
      setDragging(false);
    }
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onStageClick = (e: React.MouseEvent) => {
    if (movedRef.current) return;
    if ((e.target as HTMLElement).closest('[data-lightbox-chrome]')) return;

    // Click zooms into that exact spot for detail inspection.
    if (zoomRef.current <= 1.05) {
      zoomToward(e.clientX, e.clientY, CLICK_ZOOM);
      return;
    }
    if (zoomRef.current < MAX_ZOOM - 0.2) {
      zoomToward(e.clientX, e.clientY, Math.min(MAX_ZOOM, zoomRef.current * 1.8));
      return;
    }
    resetView();
  };

  const setPreset = (value: number) => {
    const stage = stageRef.current?.getBoundingClientRect();
    if (!stage || value <= MIN_ZOOM) {
      resetView();
      return;
    }
    zoomToward(stage.left + stage.width / 2, stage.top + stage.height / 2, value);
  };

  const zoomPercent = Math.round(zoom * 100);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex flex-col bg-black/92"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div
            data-lightbox-chrome
            className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-3 py-2.5 text-white sm:px-5"
          >
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium uppercase tracking-[0.2em] text-white/70">
                {title}
                {urls.length > 1 ? ` · ${index + 1} / ${urls.length}` : ''}
              </p>
              <p className="mt-0.5 hidden text-[10px] tracking-wide text-white/45 sm:block">{labels.hint}</p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {ZOOM_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  data-lightbox-chrome
                  onClick={() => setPreset(preset)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] transition',
                    Math.abs(zoom - preset) < 0.15
                      ? 'border-white bg-white text-black'
                      : 'border-white/25 text-white/85 hover:bg-white/10'
                  )}
                >
                  {preset === 1 ? 'Fit' : `${preset}×`}
                </button>
              ))}

              <span className="mx-1 hidden min-w-[3.25rem] text-center text-[11px] tabular-nums text-white/70 sm:inline">
                {zoomPercent}%
              </span>

              <button
                type="button"
                data-lightbox-chrome
                onClick={() => {
                  const stage = stageRef.current?.getBoundingClientRect();
                  if (!stage) return;
                  zoomToward(stage.left + stage.width / 2, stage.top + stage.height / 2, zoom / 1.4);
                }}
                className="rounded-full border border-white/25 px-3 py-1 text-white hover:bg-white/10"
                aria-label={labels.zoomOut}
              >
                −
              </button>
              <button
                type="button"
                data-lightbox-chrome
                onClick={() => {
                  const stage = stageRef.current?.getBoundingClientRect();
                  if (!stage) return;
                  zoomToward(stage.left + stage.width / 2, stage.top + stage.height / 2, zoom * 1.4);
                }}
                className="rounded-full border border-white/25 px-3 py-1 text-white hover:bg-white/10"
                aria-label={labels.zoomIn}
              >
                +
              </button>
              <button
                type="button"
                data-lightbox-chrome
                onClick={resetView}
                className="hidden rounded-full border border-white/25 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-white hover:bg-white/10 sm:inline"
              >
                {labels.reset}
              </button>
              <button
                type="button"
                data-lightbox-chrome
                onClick={onClose}
                className="rounded-full border border-white/25 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-white hover:bg-white/10"
                aria-label={labels.close}
              >
                {labels.close}
              </button>
            </div>
          </div>

          <div className="relative min-h-0 flex-1">
            {urls.length > 1 ? (
              <>
                <button
                  type="button"
                  data-lightbox-chrome
                  onClick={() => onIndexChange((index - 1 + urls.length) % urls.length)}
                  className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/25 bg-black/50 px-3 py-3 text-white backdrop-blur-sm hover:bg-black/70 sm:left-4"
                  aria-label={labels.prev}
                >
                  ←
                </button>
                <button
                  type="button"
                  data-lightbox-chrome
                  onClick={() => onIndexChange((index + 1) % urls.length)}
                  className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/25 bg-black/50 px-3 py-3 text-white backdrop-blur-sm hover:bg-black/70 sm:right-4"
                  aria-label={labels.next}
                >
                  →
                </button>
              </>
            ) : null}

            <div
              ref={stageRef}
              className="absolute inset-0 touch-none overflow-hidden bg-transparent"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onClick={onStageClick}
            >
              <div
                className="flex h-full w-full items-center justify-center"
                style={{
                  transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: dragging || pinching ? 'none' : 'transform 0.12s ease-out',
                  willChange: 'transform'
                }}
              >
                {/* Full-resolution source — browser shows native pixels when zoomed. */}
                <img
                  key={url}
                  src={url}
                  alt={`${title} — image ${index + 1} of ${urls.length}`}
                  className={cn(
                    'max-h-[calc(100vh-4.5rem)] max-w-[min(100vw,1400px)] select-none object-contain',
                    zoom > MIN_ZOOM ? 'cursor-grab' : 'cursor-zoom-in',
                    dragging && 'cursor-grabbing'
                  )}
                  draggable={false}
                  decoding="async"
                />
              </div>
            </div>

            <div
              data-lightbox-chrome
              className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10 sm:px-6"
            >
              <div className="pointer-events-auto mx-auto flex max-w-md items-center gap-3">
                <span className="w-10 text-[10px] uppercase tracking-wider text-white/60">1×</span>
                <input
                  type="range"
                  min={MIN_ZOOM}
                  max={MAX_ZOOM}
                  step={0.05}
                  value={zoom}
                  aria-label={labels.zoomIn}
                  onChange={(e) => {
                    const stage = stageRef.current?.getBoundingClientRect();
                    const next = Number(e.target.value);
                    if (!stage || next <= MIN_ZOOM) {
                      resetView();
                      return;
                    }
                    zoomToward(stage.left + stage.width / 2, stage.top + stage.height / 2, next);
                  }}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/25 accent-white"
                />
                <span className="w-12 text-right text-[10px] uppercase tracking-wider text-white/60">5×</span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
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
