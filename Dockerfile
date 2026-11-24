FROM node:26-alpine AS build

WORKDIR /app

RUN npm install -g corepack@0.36.0 && corepack enable pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY astro.config.* ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

FROM node:26-alpine

WORKDIR /app

RUN npm install -g corepack@0.36.0 && corepack enable pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --prod --frozen-lockfile

COPY --from=build /app/dist ./dist
COPY astro.config.* ./

COPY migrations ./migrations
COPY scripts/migrate.ts ./scripts/

ENV PORT=4321

ENV HOST=0.0.0.0

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
