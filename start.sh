#!/usr/bin/env bash
set -euo pipefail

# Project root (this script's directory)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

##### comment from line number 8 to 18 if running locally
# Backend/API env (defaults set here; can be overridden when invoking)
export VITE_API_PROTOCOL="${VITE_API_PROTOCOL:-http}"
export VITE_API_HOST="${VITE_API_HOST:-13.235.114.249}"
export VITE_API_PORT="${VITE_API_PORT:-3000}"
export VITE_API_PREFIX="${VITE_API_PREFIX:-/api}"

# Dev server origin env (used by app utils) and CLI defaults
export VITE_DEV_PROTOCOL="${VITE_DEV_PROTOCOL:-http}"
export VITE_DEV_HOST="${VITE_DEV_HOST:-13.235.114.249}"
export VITE_DEV_PORT="${VITE_DEV_PORT:-80}"

# CLI host/port for Vite dev server
HOST=0.0.0.0
PORT=80

# Install deps if node_modules missing (safe no-op if already installed)
if [ ! -d node_modules ]; then
  echo "[start] Installing dependencies..."
  npm install --no-audit --no-fund
fi

CMD="node node_modules/vite/bin/vite.js build && node node_modules/vite/bin/vite.js preview --host ${HOST} --port ${PORT}"

if [ "${NOHUP:-}" != "" ]; then
  echo "[start] Starting in background with nohup on ${HOST}:${PORT}"
  nohup bash -lc "$CMD" > sampark-dev.out 2>&1 &
  echo $! > sampark-dev.pid
  echo "[start] PID: $(cat sampark-dev.pid). Logs: sampark-dev.out"
else
  echo "[start] Starting in foreground on ${HOST}:${PORT}"
  exec bash -lc "$CMD"
fi
