#!/bin/sh
set -e

echo "==> Preparing Vijay Jewellery Collection database..."
mkdir -p /app/prisma

# Automatically sync schema to SQLite persistent volume
npx prisma db push --skip-generate

# Ensure default site config and admin auth exist
node prisma/seed.js

echo "==> Starting production Next.js server..."
exec node server.js
