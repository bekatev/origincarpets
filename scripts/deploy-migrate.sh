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
docker run --rm --network host \
  -v "$APP_DIR/backend/prisma:/app/prisma" \
  -w /app \
  -e DATABASE_URL="$DATABASE_URL" \
  node:20-bookworm bash -lc "npx --yes prisma@6.19.3 migrate deploy --schema=/app/prisma/schema.prisma"

echo "==> Migrate done"
