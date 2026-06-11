#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/carp}"
cd "$APP_DIR"

echo "==> Free disk before build"
docker builder prune -af >/dev/null 2>&1 || true
docker image prune -af >/dev/null 2>&1 || true
docker container prune -f >/dev/null 2>&1 || true
rm -rf /root/.npm /tmp/* 2>/dev/null || true

if [[ -f .db-credentials ]]; then
  # shellcheck disable=SC1091
  source .db-credentials
  if grep -q '^DATABASE_URL=' backend/.env; then
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${DATABASE_URL}|" backend/.env
  else
    echo "DATABASE_URL=${DATABASE_URL}" >> backend/.env
  fi
fi

# shellcheck disable=SC1091
set -a && source backend/.env && set +a

echo "==> Prisma migrate"
docker run --rm --network host \
  -v "$APP_DIR:/app" -w /app/backend \
  -e DATABASE_URL="$DATABASE_URL" \
  node:20-bookworm bash -lc "npm ci --omit=dev && npx prisma migrate deploy"

if [[ -f backups/production.restore.sql && ! -f backups/.restore-complete ]]; then
  echo "==> Restore Postgres SQL backup"
  grep -v -E '^\\restrict|^\\unrestrict|transaction_timeout|default_table_access_method' \
    backups/production.restore.sql > backups/production.restore.pg10.sql
  psql "$DATABASE_URL" -v ON_ERROR_STOP=0 -f backups/production.restore.pg10.sql || true
  touch backups/.restore-complete
fi

echo "==> Build and swap (site stays up during build)"
bash scripts/deploy-production.sh

echo "==> Docker deploy done"
