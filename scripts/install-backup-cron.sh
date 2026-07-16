#!/usr/bin/env bash
# Install / refresh daily backup cron (03:15 UTC).
# Usage:
#   bash scripts/install-backup-cron.sh           # install cron + run backup now
#   bash scripts/install-backup-cron.sh --cron-only
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/carp}"
BACKUP_SCRIPT="${APP_DIR}/scripts/backup-production.sh"
CRON_MARKER="# origin-carpets-daily-backup"
CRON_LINE="15 3 * * * APP_DIR=${APP_DIR} /bin/bash ${BACKUP_SCRIPT} >> /opt/backups/cron.log 2>&1 ${CRON_MARKER}"
RUN_NOW=1
if [[ "${1:-}" == "--cron-only" ]]; then
  RUN_NOW=0
fi

if [[ ! -x "$BACKUP_SCRIPT" ]]; then
  chmod +x "$BACKUP_SCRIPT"
fi

mkdir -p /opt/backups
chmod 700 /opt/backups

# Ensure pg_dump exists (client tools)
if ! command -v pg_dump >/dev/null 2>&1; then
  echo "==> Installing postgresql-client for pg_dump"
  apt-get update -qq || true
  apt-get install -y postgresql-client || true
fi

EXISTING="$(crontab -l 2>/dev/null || true)"
FILTERED="$(printf '%s\n' "$EXISTING" | grep -v 'origin-carpets-daily-backup' || true)"
{
  printf '%s\n' "$FILTERED"
  echo "$CRON_LINE"
} | grep -v '^$' | crontab -

echo "==> Backup cron installed (daily 03:15 UTC):"
crontab -l | grep origin-carpets-daily-backup || true

if [[ "$RUN_NOW" -eq 1 ]]; then
  echo "==> Running first backup now"
  APP_DIR="$APP_DIR" /bin/bash "$BACKUP_SCRIPT"
  echo "==> Done. Backups live in /opt/backups (14-day retention)"
else
  echo "==> Cron only — skipped immediate backup"
fi
