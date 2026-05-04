#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUN_DIR="$ROOT_DIR/.postiz-run"
LOG_DIR="$RUN_DIR/logs"

mkdir -p "$LOG_DIR"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd curl
require_cmd lsof
require_cmd screen

if command -v node >/dev/null 2>&1; then
  NODE_BIN="$(command -v node)"
elif [[ -x /usr/local/bin/node ]]; then
  NODE_BIN="/usr/local/bin/node"
elif [[ -x /opt/homebrew/bin/node ]]; then
  NODE_BIN="/opt/homebrew/bin/node"
else
  echo "Missing required command: node" >&2
  exit 1
fi

NODE_VERSION="$("$NODE_BIN" -p "process.versions.node")"
NODE_MAJOR="${NODE_VERSION%%.*}"
NODE_MINOR_PATCH="${NODE_VERSION#*.}"
NODE_MINOR="${NODE_MINOR_PATCH%%.*}"

if [[ "$NODE_MAJOR" == "22" && "$NODE_MINOR" -ge 12 ]]; then
  NODE_RUNNER="$NODE_BIN"
else
  NODE_RUNNER="npx -y node@22"
fi

if command -v pnpm >/dev/null 2>&1; then
  PNPM_BIN="$(command -v pnpm)"
elif [[ -x /usr/local/bin/pnpm ]]; then
  PNPM_BIN="/usr/local/bin/pnpm"
elif command -v corepack >/dev/null 2>&1; then
  PNPM_BIN="$(command -v corepack) pnpm"
else
  echo "Missing required command: pnpm" >&2
  exit 1
fi

if command -v docker >/dev/null 2>&1; then
  DOCKER_BIN="$(command -v docker)"
elif [[ -x /usr/local/bin/docker ]]; then
  DOCKER_BIN="/usr/local/bin/docker"
elif [[ -x /opt/homebrew/bin/docker ]]; then
  DOCKER_BIN="/opt/homebrew/bin/docker"
elif [[ -x /Applications/Docker.app/Contents/Resources/bin/docker ]]; then
  DOCKER_BIN="/Applications/Docker.app/Contents/Resources/bin/docker"
else
  echo "Missing required command: docker" >&2
  exit 1
fi

export PATH="$(dirname "$NODE_BIN"):$(dirname "$PNPM_BIN"):$(dirname "$DOCKER_BIN"):/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

cleanup_port() {
  local port="$1"
  local pids
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"

  if [[ -n "$pids" ]]; then
    echo "Stopping existing process on port $port: $pids"
    kill $pids 2>/dev/null || true
    sleep 2

    pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    if [[ -n "$pids" ]]; then
      kill -9 $pids 2>/dev/null || true
    fi
  fi
}

start_service() {
  local name="$1"
  local command="$2"
  local session_file="$RUN_DIR/$name.session"
  local log_file="$LOG_DIR/$name.log"
  local session_name="postiz-$name"

  rm -f "$session_file"
  : > "$log_file"

  echo "Starting $name"
  screen -S "$session_name" -X quit >/dev/null 2>&1 || true
  screen -dmS "$session_name" bash -lc "cd \"$ROOT_DIR\" && $command >>\"$log_file\" 2>&1"
  echo "$session_name" >"$session_file"
}

wait_for_http() {
  local label="$1"
  local url="$2"
  local attempts="${3:-90}"
  local sleep_seconds="${4:-2}"

  for ((i=1; i<=attempts; i++)); do
    local code
    code="$(curl -s -o /dev/null -w '%{http_code}' "$url" || true)"
    if [[ "$code" =~ ^(200|301|302|307|308)$ ]]; then
      echo "$label is ready at $url"
      return 0
    fi
    sleep "$sleep_seconds"
  done

  echo "$label did not become ready: $url" >&2
  return 1
}

echo "Starting local dependencies"
"$DOCKER_BIN" compose -f "$ROOT_DIR/docker-compose.local-dev.yaml" up -d

cleanup_port 4200
cleanup_port 3000
cleanup_port 3002

echo "Building backend"
bash -lc "cd \"$ROOT_DIR\" && $NODE_RUNNER \"$PNPM_BIN\" --filter ./apps/backend run build"

echo "Building orchestrator"
bash -lc "cd \"$ROOT_DIR\" && $NODE_RUNNER \"$PNPM_BIN\" --filter ./apps/orchestrator run build"

start_service "backend" "exec ./node_modules/.bin/dotenv -e ./.env -- $NODE_RUNNER ./apps/backend/dist/apps/backend/src/main.js"
wait_for_http "Backend" "http://localhost:3000/auth/can-register"

start_service "orchestrator" "exec ./node_modules/.bin/dotenv -e ./.env -- $NODE_RUNNER ./apps/orchestrator/dist/apps/orchestrator/src/main.js"
wait_for_http "Orchestrator" "http://localhost:3002/health/status"

start_service "frontend" "cd ./apps/frontend && exec ../../node_modules/.bin/dotenv -e ../../.env -- $NODE_RUNNER ../../node_modules/next/dist/bin/next dev -p 4200"
wait_for_http "Frontend" "http://localhost:4200/auth" 120 2

cat <<EOF

Postiz is running:
- Frontend: http://localhost:4200
- Backend: http://localhost:3000
- Orchestrator: http://localhost:3002/health/status

Logs:
- $LOG_DIR/frontend.log
- $LOG_DIR/backend.log
- $LOG_DIR/orchestrator.log

Screen sessions:
- postiz-frontend
- postiz-backend
- postiz-orchestrator
EOF
