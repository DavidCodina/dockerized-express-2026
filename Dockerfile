#--------------------------------------------------------------------------
#
# Multi-Stage Build:
# 
# This is a very basic Express app. It currently is set up for development and production.
# The next step is to deploy the production build.
# One you've got a handle on that, begin to integrated the database + Prisma back in.
#
# If you prefer, you can switch to having Dockerfile.dev and Dockerfile.prod.
# Then reference them in each respective .yaml file:
#
#   build:
#     context: .
#     dockerfile: Dockerfile.dev | Dockerfile.prod
#
#
# That said, it's better to stick with a single Dockerfile because it leverages stage reuse.
#
## At what point do we run tests against the production image, or can we even do that now?
#
#--------------------------------------------------------------------------

# 1. deps: install all deps (needed to run the TS build)
FROM node:26-alpine3.23 AS deps
WORKDIR /app

# If you go this route, the forward slash is required.
# COPY package.json package-lock.json ./
COPY package*.json .

# npm ci instead of npm install — deterministic installs from the lockfile, which you want for reproducible builds.
RUN npm ci

# 2. build: compile TypeScript -> dist
FROM deps AS build
#--------------------------------------------------------------------------
#
# npm runs prebuild script automatically before build. 
#
#  "prebuild": "npx prisma generate --config ./prisma.config.ts",
#
# The actual prisma.config.ts references DATABASE_URL, which so far this part of the Dockerfile has
# no knowledge of, which ends up causing an error:
#
#   PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL.
# 
# npx prisma generate only needs the schema to generate the client — it doesn't need a real database connection,
# but if your config file references an env var that isn't resolvable, Prisma throws before it even gets to generation, 
# because the config loader validates all referenced env vars up front.
#
# Solution: Create a dummy DATABASE_URL.
# This should not affect the production deployment because
# 1. Multi-stage builds don't carry ENV/ARG across stages.
#    DATABASE_URL does not persist. The ARG/ENV combo in build is scoped to that stage only. 
#    Stage 5 never re-declares it, so the dummy build-time value doesn't leak into the running production container.
# 2. Even if it somehow did carry over, Render's runtime env var would win anyway.
#
#--------------------------------------------------------------------------
ARG DATABASE_URL=postgresql://dummy_user:dummy_password@db:5432/dummy_db
ENV DATABASE_URL=$DATABASE_URL
COPY . .
# The `npm run build` will run your "prebuild" script (npx prisma generate) if you kept it in package.json
RUN npm run build

# 3. prod-deps: install only production deps
FROM node:26-alpine3.23 AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
# ⚠️ Make sure prisma is NOT a dev dependency! It's still needed.
RUN npm ci --omit=dev


#--------------------------------------------------------------------------
#                 Top Level Stages: development | production
#--------------------------------------------------------------------------

#--------------------------------------------------------------------------
#
# 4. development:
#
# When npm run docker:up runs, it executes:
#
#   docker compose -f docker-compose.dev.yaml up
#
# That compose file has build.target: development, which tells Docker: "only build stage 4 (and whatever it depends on) — ignore everything else."
# So... It grabs step 1, then runs the rest of 4 here.
#
#--------------------------------------------------------------------------

FROM deps AS development
WORKDIR /app
# Make sure node_modules is in .dockerignore
COPY . . 
EXPOSE 5000
CMD ["npm", "run", "dev"]

#--------------------------------------------------------------------------
#
# 5. production:
#
# When npm run docker:prod:up runs, it executes:
#
#   docker compose -f docker-compose.dev.yaml down --rmi local -v
#
# Docker walks the dependency graph backward from there and builds only what stage 5 actually needs:
# 5 <-- 3, 5 <-- 2 <-- 1
#
#--------------------------------------------------------------------------

FROM node:26-alpine3.23 AS production
WORKDIR /app
ENV NODE_ENV=production

# Copy runtime dependencies (no dev deps)
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy built application code
COPY --from=build /app/dist ./dist
COPY package.json ./

# Copy Prisma schema + migrations so the entrypoint can run `prisma migrate deploy`
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts

COPY public ./public

#--------------------------------------------------------------------------
#
# Least Privilege:
#
# By default, if you never specify a USER, a container runs its process as root.
# That's not the same as root on your actual machine, but it's still more privilege than your Node app needs.
# f an attacker finds a way to execute arbitrary code through your app (a dependency vulnerability, a bad 
# input handling bug, whatever), running as root inside the container hands them a more powerful foothold 
# — they can write to any file, install packages, and are one misconfiguration or kernel vulnerability 
# away from potentially escaping to the host.
#
# Running as an unprivileged user doesn't eliminate risk, but it caps the blast radius. This is the general 
# principle of least privilege: give the process only what it actually needs.
#
# This creates a new, unprivileged group and user, both named nodejs.
#
#   RUN addgroup -S nodejs && adduser -S nodejs -G nodejs
#
# addgroup -S nodejs — creates a group called nodejs. 
# The -S flag means "system group": no password, lower/system-range GID, meant for running 
# services rather than being a human's login account.
#
# adduser -S nodejs -G nodejs — creates a user called nodejs and adds it to the nodejs group (-G nodejs). 
# -S again means "system user" — no password prompt, no home directory setup, nothing interactive. 
# It's built specifically to be a lightweight service account, not someone who'll ever log in. 
#
# Note: doing this could cause issues if you try to do certain commands in the container.
# However, you can also do this: docker compose exec -u root ...
#
# See here fore more info:
#
#   https://www.udemy.com/course/docker-mastery-for-nodejs/learn/lecture/13970558#overview
#   https://www.udemy.com/course/docker-mastery-for-nodejs/learn/lecture/14274050#overview
#
## Rather than doing this, can we instead do this:
##
## USER node
# 
#--------------------------------------------------------------------------

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

# Copy production entrypoint and make executable
COPY docker-prod-entrypoint.sh /app/docker-prod-entrypoint.sh
RUN chmod +x /app/docker-prod-entrypoint.sh

# Ensure nodejs user can read app files and node_modules
RUN chown -R nodejs:nodejs /app

#--------------------------------------------------------------------------
#
# This tells Docker: from this line onward, every subsequent instruction — and critically, the final CMD 
# — runs as the nodejs user instead of root. So node dist/index.js actually executes as this unprivileged user, not root.
#
#   USER nodejs
#
#--------------------------------------------------------------------------
USER nodejs
EXPOSE 5000 
ENTRYPOINT ["/app/docker-prod-entrypoint.sh"]
CMD ["node", "dist/index.js"]

#--------------------------------------------------------------------------
#
# Everything copied over to stage 5 is as follows:
#
#   app/
#     dist/
#     public/
#     package.json
#     node_modueles
#     prisma/
#     prisma.config.ts
#     docker-prod-entrypoint.sh
#
# Note: No package-lock.json in the final image. You copy package.json but never the lockfile into stage 5. 
# Harmless at runtime (nothing needs it post-install), but worth knowing if you ever want to npm ci inside 
# the running container for debugging.
#
#--------------------------------------------------------------------------
