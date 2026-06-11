#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/carp}"
BACKUP_ROOT="${BACKUP_ROOT:-/opt/backups}"

echo "==> Deploying Origin Carpets to ${APP_DIR}"

if [[ ! -s /root/.nvm/nvm.sh ]]; then
  echo "==> Installing nvm"
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi

export NVM_DIR="/root/.nvm"
# shellcheck disable=SC1091
source "$NVM_DIR/nvm.sh"

# Ubuntu 18.04 (glibc 2.27) — Node 16 is the newest compatible runtime
if ! nvm ls 16 >/dev/null 2>&1; then
  echo "==> Installing Node 16"
  nvm install 16
fi
nvm alias default 16
nvm use 16

# shellcheck disable=SC1091
source /root/.nvm/nvm.sh 2>/dev/null || true

if ! command -v psql >/dev/null; then
  echo "==> Installing PostgreSQL (Ubuntu package)"
  apt-get update -qq || true
  apt-get install -y postgresql postgresql-contrib
  systemctl enable postgresql
  systemctl start postgresql
fi

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='carpets'" | grep -q 1; then
  DB_PASS="$(openssl rand -hex 16)"
  sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
CREATE USER carpets WITH PASSWORD '${DB_PASS}' CREATEDB;
CREATE DATABASE carpets OWNER carpets;
SQL
  echo "DATABASE_URL=postgresql://carpets:${DB_PASS}@localhost:5432/carpets" > "${APP_DIR}/.db-credentials"
  chmod 600 "${APP_DIR}/.db-credentials"
  echo "==> Created Postgres user 'carpets' (credentials in ${APP_DIR}/.db-credentials)"
fi

cd "$APP_DIR"

if [[ -f "${APP_DIR}/.db-credentials" ]]; then
  # shellcheck disable=SC1091
  source "${APP_DIR}/.db-credentials"
  if [[ -f backend/.env ]]; then
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${DATABASE_URL}|" backend/.env
  fi
fi

if [[ ! -f backend/.env ]]; then
  echo "ERROR: backend/.env missing — create it before deploy"
  exit 1
fi

# shellcheck disable=SC1091
set -a
source backend/.env
set +a

echo "==> Installing dependencies"
npm ci

echo "==> Prisma migrate + generate"
cd backend
npx prisma generate
npx prisma migrate deploy
cd ..

if [[ -f backups/production.restore.dump ]]; then
  echo "==> Restoring Postgres backup"
  pg_restore --clean --if-exists --no-owner --dbname="$DATABASE_URL" backups/production.restore.dump || true
fi

echo "==> Building"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}"
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-https://origincarpets.com/api}"
npm run build

echo "==> PM2 processes"
pm2 delete carp-api carp-web 2>/dev/null || true
pm2 start dist/main.js --name carp-api --cwd "$APP_DIR/backend"
pm2 start npm --name carp-web --cwd "$APP_DIR/frontend" -- start
pm2 save

echo "==> Deploy complete"
