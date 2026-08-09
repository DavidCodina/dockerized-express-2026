#--------------------------------------------------------------------------
#
# Multi-Stage Build:
# 
# This is a very basic Express app. It currently is set up for development and production.
# The next step is to deploy the production build.
# One you've got a handle on that, begin to integrated the database + Prisma back in.
#
#--------------------------------------------------------------------------

# 1.  ---- deps: install all deps (needed to run the TS build) ----
FROM node:26-alpine3.23 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# npm ci instead of npm install — deterministic installs from the lockfile, which you want for reproducible builds.
RUN npm ci

# 2.  ---- build: compile TypeScript -> dist ----
FROM deps AS build
COPY . .
# The `npm run build` will run your "prebuild" script (npx prisma generate) if you kept it in package.json
RUN npm run build

# 3.  ---- prod-deps: install only production deps ----
FROM node:26-alpine3.23 AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
# Make sure prisma is NOT a dev dependency!
RUN npm ci --omit=dev


#--------------------------------------------------------------------------
#
#--------------------------------------------------------------------------

# 4. 
# When npm run docker:up runs, it executes: docker compose -f docker-compose.dev.yaml up --watch.
# That compose file has build.target: development, which tells Docker: "only build stage 4 (and whatever it depends on) — ignore everything else."
# So... It grabs step 1, then runs the rest of 4 here.
FROM deps AS development
WORKDIR /app
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

# 5. 
# When npm run docker:prod:up runs, it executes: docker compose --env-file .env.production -f docker-compose.prod.yaml up -d --build",
# Docker walks the dependency graph backward from there and builds only what stage 5 actually needs:
# 5 <-- 3, 5 <-- 2 <-- 1
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

#--------------------------------------------------------------------------
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




