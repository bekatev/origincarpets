import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

/** Nest/Docker writable dir used when legacy nginx upload root is unavailable. */
export function resolveUploadsDir() {
  const candidates = [
    // Production Docker entrypoint runs with cwd=/app/backend
    join(process.cwd(), 'uploads'),
    // Local monorepo when API is started from repo root
    join(process.cwd(), 'backend', 'uploads'),
    // Compiled dist/ fallback
    join(__dirname, '..', 'uploads'),
    join(__dirname, '..', '..', 'uploads')
  ];

  const existing = candidates.find((dir) => existsSync(dir));
  if (existing) return existing;

  const fallback = candidates[0];
  mkdirSync(fallback, { recursive: true });
  return fallback;
}

export type UploadTarget = {
  dir: string;
  /** Public URL path for a stored filename (leading slash, no host). */
  publicUrl: (storedName: string) => string;
  mode: 'legacy' | 'api';
};

/**
 * Prefer the same directory nginx already serves for catalog images
 * (`/<file>.webp` at site root). Fall back to Nest `/api/media/<file>`.
 */
export function resolveUploadTarget(): UploadTarget {
  // Only use a legacy host folder when explicitly configured — never auto-mount
  // absolute server paths from compose (that broke deploys).
  const legacy = process.env.LEGACY_UPLOADS_DIR;
  if (legacy && existsSync(legacy)) {
    return {
      dir: legacy,
      publicUrl: (storedName) => `/${storedName}`,
      mode: 'legacy'
    };
  }

  const dir = resolveUploadsDir();
  return {
    dir,
    publicUrl: (storedName) => `/api/media/${storedName}`,
    mode: 'api'
  };
}

/** Directories to search when serving a previously uploaded file. */
export function resolveMediaSearchDirs() {
  const dirs = new Set<string>();
  dirs.add(resolveUploadTarget().dir);
  dirs.add(resolveUploadsDir());
  const legacy = process.env.LEGACY_UPLOADS_DIR;
  if (legacy && existsSync(legacy)) dirs.add(legacy);
  return [...dirs];
}
