#!/bin/bash

# FIX: Dockerfile.dev là single-stage, không có --target dist hay --target devcontainer.
# Script cũ gọi 2 stage không tồn tại → build fail.
# Script mới build 1 image duy nhất từ single-stage Dockerfile.dev.

set -euo pipefail
set -o xtrace

docker rmi localhost/postiz 2>/dev/null || true
docker build -t localhost/postiz -f Dockerfile.dev .
