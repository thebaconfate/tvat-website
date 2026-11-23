# Stage 1: Build the application
FROM node:26-alpine AS build

WORKDIR /app

# pnpm, at the version in packageManager (package.json). Node 25+ no longer
# bundles Corepack, so it comes from npm.
RUN npm install -g corepack@0.36.0 && corepack enable pnpm

# Install dependencies. pnpm-workspace.yaml holds the build-script approvals
# (bcrypt, esbuild) and the supply-chain policies, so it must come along.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY astro.config.* ./

RUN pnpm install --frozen-lockfile

# Copy project files and build the app
COPY . .

RUN pnpm build

# Stage 2: Set up a production server
FROM node:26-alpine

WORKDIR /app

RUN npm install -g corepack@0.36.0 && corepack enable pnpm

# Install production dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --prod --frozen-lockfile

# Copy build files from the build stage
COPY --from=build /app/dist ./dist
COPY astro.config.* ./

# The database migrations, for `pnpm db:migrate` (Railway's pre-deploy command)
COPY migrations ./migrations
COPY scripts/migrate.ts ./scripts/

# Overrides default port (even though default is 4312)
ENV PORT=4321

# Required for astro applications. Otherwise it listens to localhost which won't
# be exposed in a container
ENV HOST=0.0.0.0

# Expose the app's port
EXPOSE 4321

# Start the server. CMD rather than ENTRYPOINT, so another command (like Railway's
# pre-deploy `pnpm db:migrate`) replaces it instead of being passed to it as arguments.
CMD ["node", "./dist/server/entry.mjs"]
