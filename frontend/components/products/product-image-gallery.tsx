'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type WheelEvent as ReactWheelEvent
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useI18n } from '@/components/providers/i18n-provider';
import { cn } from '@/lib/cn';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.35;

/** Very light beige — soft contrast for carpets in light and dark theme. */
const FRAME_BG = '#f4ebe0';

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
          <span className="pointer-events-none absolute bottom-3 left-3 z-10 inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white backdrop-blur-sm opacity-90 transition group-hover:opacity-100">
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
          zoomOut: d.zoomOut
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
  };
}) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const url = urls[index];

  const resetView = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
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
      if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
      if (e.key === '-' || e.key === '_') setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
      if (e.key === '0') resetView();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, index, urls.length, onClose, onIndexChange, resetView]);

  const onWheel = (e: ReactWheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoom((z) => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta));
      if (next <= MIN_ZOOM) setOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (zoom <= MIN_ZOOM) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    setOffset({
      x: drag.ox + (e.clientX - drag.x),
      y: drag.oy + (e.clientY - drag.y)
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current = null;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const toggleZoom = () => {
    if (zoom > MIN_ZOOM) {
      resetView();
    } else {
      setZoom(2);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex flex-col bg-black/88 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-white sm:px-6">
            <p className="truncate text-[11px] font-medium uppercase tracking-[0.2em] text-white/70">
              {title}
              {urls.length > 1 ? ` · ${index + 1} / ${urls.length}` : ''}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
                className="oc-nav-link rounded-full border border-white/25 px-3 py-1.5 text-white hover:bg-white/10"
                aria-label={labels.zoomOut}
              >
                −
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
                className="oc-nav-link rounded-full border border-white/25 px-3 py-1.5 text-white hover:bg-white/10"
                aria-label={labels.zoomIn}
              >
                +
              </button>
              <button
                type="button"
                onClick={onClose}
                className="oc-nav-link rounded-full border border-white/25 px-3 py-1.5 text-white hover:bg-white/10"
                aria-label={labels.close}
              >
                {labels.close}
              </button>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-4 sm:px-6">
            {urls.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => onIndexChange((index - 1 + urls.length) % urls.length)}
                  className="absolute left-2 z-10 rounded-full border border-white/25 bg-black/40 px-3 py-3 text-white backdrop-blur-sm hover:bg-black/60 sm:left-4"
                  aria-label={labels.prev}
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => onIndexChange((index + 1) % urls.length)}
                  className="absolute right-2 z-10 rounded-full border border-white/25 bg-black/40 px-3 py-3 text-white backdrop-blur-sm hover:bg-black/60 sm:right-4"
                  aria-label={labels.next}
                >
                  →
                </button>
              </>
            ) : null}

            <div
              className="relative flex h-full max-h-[calc(100vh-5.5rem)] w-full max-w-6xl items-center justify-center overflow-hidden bg-transparent"
              onWheel={onWheel}
              onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
              }}
            >
              <motion.img
                key={url}
                src={url}
                alt={`${title} — image ${index + 1} of ${urls.length}`}
                drag={false}
                onDoubleClick={toggleZoom}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  'max-h-full max-w-full select-none object-contain',
                  zoom > MIN_ZOOM ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
                )}
                style={{
                  transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: dragging ? 'none' : 'transform 0.2s ease'
                }}
                draggable={false}
              />
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
