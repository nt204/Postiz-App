#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUN_DIR="$ROOT_DIR/.postiz-run"

stop_screen_session() {
  local session_file="$1"

  if [[ ! -f "$session_file" ]]; then
    return 0
  fi

  local session_name
  session_name="$(cat "$session_file")"
  screen -S "$session_name" -X quit >/dev/null 2>&1 || true
  rm -f "$session_file"
}

stop_port() {
  local port="$1"
  local pids
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"

  if [[ -n "$pids" ]]; then
    kill $pids 2>/dev/null || true
    sleep 2
    pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    if [[ -n "$pids" ]]; then
      kill -9 $pids 2>/dev/null || true
    fi
  fi
}

stop_screen_session "$RUN_DIR/frontend.session"
stop_screen_session "$RUN_DIR/backend.session"
stop_screen_session "$RUN_DIR/orchestrator.session"

rm -f "$RUN_DIR/frontend.pid" "$RUN_DIR/backend.pid" "$RUN_DIR/orchestrator.pid"

stop_port 4200
stop_port 3000
stop_port 3002

echo "Postiz app processes stopped."
echo "If you also want to stop Docker services, run:"
echo "docker compose -f \"$ROOT_DIR/docker-compose.local-dev.yaml\" down"
