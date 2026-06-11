#!/usr/bin/env bash
set -euo pipefail

cd /app/backend
node dist/main.js &
API_PID=$!

cd /app/frontend
npm start &
WEB_PID=$!

wait -n "$API_PID" "$WEB_PID"
