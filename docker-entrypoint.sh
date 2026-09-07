#!/bin/sh
set -e

echo "==> Checking database..."
mkdir -p /app/prisma

if [ ! -s /app/prisma/dev.db ]; then
  echo "==> Initializing persistent database from template..."
  cp /app/prisma-template.db /app/prisma/dev.db
  chmod 666 /app/prisma/dev.db 2>/dev/null || true
fi

echo "==> Starting production Next.js server..."
exec node server.js
