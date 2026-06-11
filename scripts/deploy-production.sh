#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/carp}"
cd "$APP_DIR"

echo "==> Deploy starting (site stays up during build)"

PREV_SHA="$(git rev-parse HEAD 2>/dev/null || true)"
git config --global --add safe.directory "$APP_DIR" 2>/dev/null || true
if [ ! -d .git ]; then
  git init
  git remote add origin https://github.com/bekatev/origincarpets.git
fi
git fetch origin main
git reset --hard origin/main
NEW_SHA="$(git rev-parse HEAD)"

NEEDS_BUILD=1
if [ -n "$PREV_SHA" ] && [ "$PREV_SHA" != "$NEW_SHA" ]; then
  if ! git diff --name-only "$PREV_SHA" "$NEW_SHA" | grep -qv '^frontend/public/'; then
    NEEDS_BUILD=0
    echo "==> Only static assets changed — skipping Docker rebuild"
  fi
fi

docker image prune -f >/dev/null 2>&1 || true
docker builder prune -f --filter "until=72h" >/dev/null 2>&1 || true

avail_kb=$(df / | awk 'NR==2 {print $4}')
if [ "$avail_kb" -lt 1500000 ]; then
  echo "WARNING: Low disk (${avail_kb}KB free). Build may fail; existing site is left running."
fi

bash scripts/deploy-migrate.sh

if [ "$NEEDS_BUILD" -eq 1 ]; then
  echo "==> Build new image (old container still serving traffic)"
  export DOCKER_BUILDKIT=1
  export COMPOSE_DOCKER_CLI_BUILD=1
  docker-compose -f docker-compose.prod.yml build
  echo "==> Swap to new container (brief downtime while Next.js starts)"
  docker-compose -f docker-compose.prod.yml up -d --force-recreate --no-build
  docker image prune -f >/dev/null 2>&1 || true
else
  echo "==> Reload static files (no downtime)"
  docker-compose -f docker-compose.prod.yml up -d --no-build
fi

echo "==> Deploy complete ($(git log -1 --oneline))"
docker ps --filter name=origincarpets-app
