#!/bin/sh
set -e

echo "Running Prisma migrations..."
# Watch out with this if you're using the actual production DATABASE_URL in .env.production.
# Generally speaking, you shoudn't be doing that anywas.
npx prisma migrate deploy

echo "Starting production process..."
exec "$@"

# Make sure this file is executable
# chmod +x docker-prod-entrypoint.sh