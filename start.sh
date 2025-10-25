#!/usr/bin/env bash
set -euo pipefail

# Project root (this script's directory)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# App management
APP_NAME="sampark_service"
PID_FILE="${APP_NAME}.pid"
LOG_FILE="${APP_NAME}.out"

##### comment from line number 8 to 18 if running locally
# Backend/API env (defaults set here; can be overridden when invoking)
export VITE_API_PROTOCOL="${VITE_API_PROTOCOL:-https}"
export VITE_API_HOST="${VITE_API_HOST:-api.rsssgs.com}"
export VITE_API_PORT="${VITE_API_PORT:-}"
export VITE_API_PREFIX="${VITE_API_PREFIX:-/api}"

# Dev server origin env (used by app utils) and CLI defaults
export VITE_DEV_PROTOCOL="${VITE_DEV_PROTOCOL:-http}"
export VITE_DEV_HOST="${VITE_DEV_HOST:-3.109.132.197}"
export VITE_DEV_PORT="${VITE_DEV_PORT:-8080}"

# CLI host/port for Vite dev server
HOST=0.0.0.0
PORT=8080

# Install deps if node_modules missing (safe no-op if already installed)
if [ ! -d node_modules ]; then
  echo "[start] Installing dependencies..."
  npm install --no-audit --no-fund
fi

# Function to check if app is running
is_running() {
  if [ -f "$PID_FILE" ] && ps -p "$(cat "$PID_FILE")" > /dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

# Function to start the app
start_app() {
  if is_running; then
    echo "[start] $APP_NAME is already running with PID $(cat "$PID_FILE")"
    return 0
  fi

  echo "[start] Starting $APP_NAME on ${HOST}:${PORT}..."
  CMD="node node_modules/vite/bin/vite.js build && node node_modules/vite/bin/vite.js preview --host ${HOST} --port ${PORT}"
  
  # Always run in background when called from command line
  nohup bash -lc "$CMD" > "$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"
  echo "[start] Started $APP_NAME with PID $(cat "$PID_FILE"). Logs: $LOG_FILE"
  echo "[start] To stop: ./start.sh stop"
  echo "[start] To view logs: ./start.sh logs"
}

# Function to stop the app
stop_app() {
  # First, kill any untracked Vite processes
  echo "[stop] Killing any existing Vite processes..."
  pkill -f "vite.js preview" 2>/dev/null || true
  
  if ! is_running; then
    echo "[stop] $APP_NAME is not running"
    rm -f "$PID_FILE"
    return 0
  fi

  PID=$(cat "$PID_FILE")
  echo "[stop] Stopping $APP_NAME (PID: $PID)..."
  kill "$PID" 2>/dev/null || true
  
  # Wait for graceful shutdown
  for i in {1..10}; do
    if ! ps -p "$PID" > /dev/null 2>&1; then
      echo "[stop] $APP_NAME stopped successfully"
      rm -f "$PID_FILE"
      return 0
    fi
    sleep 1
  done
  
  # Force kill if still running
  echo "[stop] Force killing $APP_NAME..."
  kill -9 "$PID" 2>/dev/null || true
  rm -f "$PID_FILE"
  echo "[stop] $APP_NAME force stopped"
}

# Function to restart the app
restart_app() {
  echo "[restart] Restarting $APP_NAME..."
  stop_app
  sleep 2
  start_app
}

# Function to show status
show_status() {
  if is_running; then
    PID=$(cat "$PID_FILE")
    echo "[status] $APP_NAME is running with PID $PID"
    echo "[status] Logs: $LOG_FILE"
    echo "[status] URL: http://${HOST}:${PORT}"
  else
    echo "[status] $APP_NAME is not running"
  fi
}

# Function to show logs
show_logs() {
  if [ -f "$LOG_FILE" ]; then
    tail -f "$LOG_FILE"
  else
    echo "[logs] No log file found: $LOG_FILE"
  fi
}

# Main script logic
case "${1:-start}" in
  start)
    start_app
    ;;
  stop)
    stop_app
    ;;
  restart)
    restart_app
    ;;
  status)
    show_status
    ;;
  logs)
    show_logs
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status|logs}"
    echo ""
    echo "Commands:"
    echo "  start   - Start the application (default)"
    echo "  stop    - Stop the application"
    echo "  restart - Restart the application"
    echo "  status  - Show application status"
    echo "  logs    - Show application logs"
    exit 1
    ;;
esac
