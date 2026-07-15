import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

/** Resolve a writable uploads directory that matches the static `/uploads` mount. */
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
