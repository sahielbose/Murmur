#!/usr/bin/env sh
# Start the local Postgres + pgvector database.
# Prefers Docker Compose; falls back to `docker run` when the Compose plugin
# isn't installed so the secret-free build runs on any Docker host.
set -e

if docker compose version >/dev/null 2>&1; then
  exec docker compose up -d db
fi

echo "Docker Compose plugin not found — using 'docker run' fallback."

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [ -n "$(docker ps -aq -f name=^/murmur-db$)" ]; then
  docker start murmur-db
else
  docker run -d \
    --name murmur-db \
    --restart unless-stopped \
    -e POSTGRES_USER=murmur \
    -e POSTGRES_PASSWORD=murmur \
    -e POSTGRES_DB=murmur \
    -p 5432:5432 \
    -v murmur-db-data:/var/lib/postgresql/data \
    -v "$ROOT/db/init:/docker-entrypoint-initdb.d:ro" \
    pgvector/pgvector:pg16
fi
