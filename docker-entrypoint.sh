#!/bin/sh
set -e


## Gotcha: does not wait for Postgres to be ready before running prisma generate, prisma migrate deploy, and prisma db seed. That will cause race conditions.
## Add a pg_isready loop at the top of the script so Prisma commands only run after the DB is accepting connections.


#! This also seems really problematic. It requires you to manually delete the .migrated file from the host if you're
#! recreating the container.
FLAG_FILE="/app/.migrated"

# Only run migrations if the flag file DOES NOT exist
if [ ! -f "$FLAG_FILE" ]; then
 
  printf "\nFirst run detected! Running 'prisma generated' and 'prisma migrate deploy'...\n\n"

  npx prisma generate --config ./prisma.config.ts
  npx prisma migrate deploy

  printf "\nChecking and seeding initial data...\n\n"
  npx prisma db seed

  # Create the flag file so subsequent sync+restarts skip this
  touch "$FLAG_FILE"
else
  printf "\nMigrations already initialized, skipping.\n\n"
fi

# Hand off to the actual dev server process (npm run dev / tsx watch)
exec "$@"