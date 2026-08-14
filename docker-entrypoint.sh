#!/bin/sh
set -e

## Gotcha: does not wait for Postgres to be ready before running prisma generate, prisma migrate deploy, and prisma db seed. That will cause race conditions.
## Add a pg_isready loop at the top of the script so Prisma commands only run after the DB is accepting connections.

printf "\n\nFirst run detected! Running 'prisma generate', 'prisma migrate deploy' and 'prisma db seed'...\n\n"
npx prisma generate --config ./prisma.config.ts
# Keep migrate deploy (i.e., not migrate dev), even though this is a dev image. What
# matters isn't "dev build vs prod build" — it's "am I running this in an unattended 
# script, or interactively at my keyboard while actively changing the schema?"
npx prisma migrate deploy

#--------------------------------------------------------------------------
#
# The seed.ts script currently checks if there are 0 posts, if so it runs.
# Otherwise, it skips seeding. Alternatively, you could remove seeding here, 
# and do something like this in package.json:
#
#   "docker:up:seed": "docker compose up -d && docker exec -it NODE_CONTAINER npx prisma db seed && docker compose logs -f",
#
#--------------------------------------------------------------------------
npx prisma db seed
exec "$@"

