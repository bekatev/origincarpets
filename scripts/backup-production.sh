#!/usr/bin/env bash
# Daily production backup: Postgres dump + product uploads.
# Keeps RETENTION_DAYS copies under BACKUP_ROOT.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/carp}"
BACKUP_ROOT="${BACKUP_ROOT:-/opt/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
STAMP="$(date -u +%Y-%m-%d_%H%M%S)"
DAY="$(date -u +%Y-%m-%d)"
DEST="${BACKUP_ROOT}/${DAY}"
LOG="${BACKUP_ROOT}/backup.log"

mkdir -p "$DEST" "$BACKUP_ROOT"
chmod 700 "$BACKUP_ROOT" 2>/dev/null || true

log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG"
}

cd "$APP_DIR"

if [[ -f .db-credentials ]]; then
  # shellcheck disable=SC1091
  set -a && source .db-credentials && set +a
fi
if [[ -f backend/.env ]]; then
  # Prefer live DATABASE_URL from app env
  # shellcheck disable=SC1091
  set -a && source backend/.env && set +a
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  log "ERROR: DATABASE_URL is not set"
  exit 1
fi

# Prisma URLs often include ?schema=public — pg_dump rejects that query param
PG_DUMP_URL="$(printf '%s' "$DATABASE_URL" | sed -E 's/[?&]schema=[^&]*//g; s/\?&/?/g; s/\?$//')"

if ! command -v pg_dump >/dev/null 2>&1; then
  log "ERROR: pg_dump not found — install postgresql-client"
  exit 1
fi

log "Backup start → ${DEST}"

DUMP_FILE="${DEST}/postgres_${STAMP}.dump"
pg_dump --format=custom --compress=9 --no-owner --no-acl --file="$DUMP_FILE" "$PG_DUMP_URL"
DUMP_SIZE="$(du -h "$DUMP_FILE" | awk '{print $1}')"
log "DB dump OK (${DUMP_SIZE}): ${DUMP_FILE}"

UPLOADS_SRC="${APP_DIR}/data/uploads"
if [[ -d "$UPLOADS_SRC" ]]; then
  UPLOADS_TAR="${DEST}/uploads_${STAMP}.tar.gz"
  tar -czf "$UPLOADS_TAR" -C "${APP_DIR}/data" uploads
  UP_SIZE="$(du -h "$UPLOADS_TAR" | awk '{print $1}')"
  log "Uploads OK (${UP_SIZE}): ${UPLOADS_TAR}"
else
  log "WARNING: uploads dir missing (${UPLOADS_SRC}) — skipped"
fi

# Remove older day folders beyond retention
find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d -name '????-??-??' -mtime "+${RETENTION_DAYS}" -exec rm -rf {} +
log "Retention: kept last ${RETENTION_DAYS} days"
log "Backup complete"
