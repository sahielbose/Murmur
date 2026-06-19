#!/usr/bin/env sh
# Stop the local database (Compose if present, otherwise the docker container).
set -e

if docker compose version >/dev/null 2>&1; then
  exec docker compose down
fi

docker stop murmur-db 2>/dev/null || true
docker rm murmur-db 2>/dev/null || true
