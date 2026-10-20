#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/carp}"
cd "$APP_DIR"

echo "==> Deploy starting (site stays up during build)"

PREV_SHA="${PREV_SHA:-$(git rev-parse HEAD 2>/dev/null || true)}"
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

echo "==> Disk before cleanup: $(df -h / | awk 'NR==2 {print $4}') free"
docker container prune -f >/dev/null 2>&1 || true
if [ "$NEEDS_BUILD" -eq 1 ]; then
  # The droplet disk is too small to keep build cache between deploys.
  # `image prune -a` keeps the image of the running container, so the site stays up.
  docker builder prune -af >/dev/null 2>&1 || true
  docker image prune -af >/dev/null 2>&1 || true
  rm -rf /root/.npm 2>/dev/null || true
  journalctl --vacuum-size=200M >/dev/null 2>&1 || true
  # Same rotation as backup-production.sh: newest 3 daily folders; migration-* etc. untouched.
  ls -1d /opt/backups/????-??-?? 2>/dev/null | sort -r | tail -n +4 | while read -r dir; do
    echo "    removing old backup $dir"
    rm -rf "$dir"
  done || true
else
  docker image prune -f >/dev/null 2>&1 || true
fi
echo "==> Disk after cleanup: $(df -h / | awk 'NR==2 {print $4}') free"

avail_kb=$(df / | awk 'NR==2 {print $4}')
if [ "$avail_kb" -lt 3000000 ]; then
  echo "WARNING: Low disk (${avail_kb}KB free). Build may fail; existing site is left running."
  echo "==> Largest disk users"
  du -xsh /opt/backups "$APP_DIR/backups" "$APP_DIR/data" /var/lib/docker /var/lib/postgresql /var/log /root /tmp 2>/dev/null | sort -rh || true
  docker system df 2>/dev/null || true
  du -xh --max-depth=1 /var/lib/docker/containers 2>/dev/null | sort -rh | head -5 || true
  du -xh --max-depth=1 /opt/backups 2>/dev/null | sort -rh | head -20 || true
fi

bash scripts/deploy-migrate.sh

mkdir -p "$APP_DIR/data/uploads"

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

# Keep daily DB + uploads backup cron in sync (does not dump on every deploy)
if [[ -f scripts/install-backup-cron.sh ]]; then
  bash scripts/install-backup-cron.sh --cron-only || echo "WARNING: backup cron install failed"
fi

echo "==> Deploy complete ($(git log -1 --oneline))"
docker ps --filter name=origincarpets-app
