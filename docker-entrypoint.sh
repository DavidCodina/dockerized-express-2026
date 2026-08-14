#!/bin/sh
set -e

## Gotcha: does not wait for Postgres to be ready before running prisma generate, prisma migrate deploy, and prisma db seed. That will cause race conditions.
## Add a pg_isready loop at the top of the script so Prisma commands only run after the DB is accepting connections.

printf "\nFirst run detected! Running 'prisma generated' and 'prisma migrate deploy'...\n\n"
npx prisma generate --config ./prisma.config.ts
# Keep migrate deploy, even though this is a dev image. The distinction that matters 
# isn't  "dev build vs prod build" — it's "am I running this in an unattended script, 
# or interactively at my keyboard while actively changing the schema?"
npx prisma migrate deploy
exec "$@"

