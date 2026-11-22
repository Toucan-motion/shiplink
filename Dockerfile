# Production image for Path B in docs/DEPLOY.md (everything on Railway).
# Railway builds it in the cloud from your GitHub repo: you don't need Docker
# on your machine. Vercel (Path A) doesn't use this file.
#
# Three stages: install dependencies, build, then copy only what the server
# needs into a small final image.

# ---- 1. Dependencies --------------------------------------------------------
FROM node:24-alpine AS deps
RUN npm install -g pnpm@12.21.0
WORKDIR /app

# Only the files that decide what gets installed. While they don't change,
# Docker reuses this layer and skips the install on the next build.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ---- 2. Build ---------------------------------------------------------------
FROM node:24-alpine AS builder
RUN npm install -g pnpm@12.21.0
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# The build needs no environment variables: the app reads them at runtime
# (see src/core/env.ts), so no secret is ever baked into the image.
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# The migration runner as one self-contained file (see scripts/migrate.ts).
RUN pnpm exec esbuild scripts/migrate.ts --bundle --platform=node --format=cjs --outfile=migrate.cjs

# ---- 3. Runtime -------------------------------------------------------------
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# The standalone server, plus the static files it doesn't copy by itself.
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

# For Railway's pre-deploy command `node migrate.cjs`. The migrations keep
# their path from the repo, which is where the script looks by default.
COPY --from=builder --chown=node:node /app/migrate.cjs ./migrate.cjs
COPY --from=builder --chown=node:node /app/src/core/db/migrations ./src/core/db/migrations

# Don't run as root. The official Node image comes with a "node" user.
USER node
EXPOSE 3000
CMD ["node", "server.js"]
