#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting production process..."
exec "$@"

# Make sure this file is executable
# chmod +x docker-prod-entrypoint.sh