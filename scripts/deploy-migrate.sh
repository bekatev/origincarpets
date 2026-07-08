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
# Run the pinned Prisma CLI standalone — `migrate deploy` only needs the schema,
# the migrations folder and DATABASE_URL, so we avoid installing the whole
# workspace (which caused corrupted node_modules) and avoid npx grabbing Prisma 7.
docker run --rm --network host \
  -v "$APP_DIR:/app" -w /app/backend \
  -e DATABASE_URL="$DATABASE_URL" \
  node:20-bookworm bash -lc "npx --yes prisma@6.19.3 migrate deploy"

echo "==> Migrate done"
