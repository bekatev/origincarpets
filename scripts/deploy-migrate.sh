#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/carp}"
cd "$APP_DIR"

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
# Full install (not --omit=dev): the prisma CLI is a devDependency and its config
# loader (c12 → rc9 → destr) is required to run `prisma migrate deploy`.
docker run --rm --network host \
  -v "$APP_DIR:/app" -w /app/backend \
  -e DATABASE_URL="$DATABASE_URL" \
  node:20-bookworm bash -lc "cd /app && npm ci && cd backend && npx prisma migrate deploy"

echo "==> Migrate done"
