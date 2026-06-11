#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/carp}"
cd "$APP_DIR"

echo "==> Deploy starting (site stays up during build)"

# Reclaim space without stopping the running container or removing its image.
docker image prune -f >/dev/null 2>&1 || true
docker builder prune -f --filter "until=72h" >/dev/null 2>&1 || true

avail_kb=$(df / | awk 'NR==2 {print $4}')
if [ "$avail_kb" -lt 1500000 ]; then
  echo "WARNING: Low disk (${avail_kb}KB free). Build may fail; existing site is left running."
fi

bash scripts/deploy-migrate.sh

echo "==> Build new image (old container still serving traffic)"
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
docker-compose -f docker-compose.prod.yml build

echo "==> Swap to new container (brief downtime, a few seconds)"
docker-compose -f docker-compose.prod.yml up -d --force-recreate --no-build

echo "==> Remove old unused images"
docker image prune -f >/dev/null 2>&1 || true

echo "==> Deploy complete"
docker ps --filter name=origincarpets-app
