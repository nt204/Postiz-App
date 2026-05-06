#!/usr/bin/env bash

# FIX: Script cũ map 3000:3000 và 4200:4200 nhưng nginx trong image listen 5000
# và docker-compose public 4007:5000. Đồng bộ lại port map đúng.

set -euo pipefail

docker kill postiz 2>/dev/null || true
docker rm postiz 2>/dev/null || true
docker create \
  --name postiz \
  -p 4007:5000 \
  -v postiz-uploads:/uploads \
  -v postiz-config:/config \
  localhost/postiz
