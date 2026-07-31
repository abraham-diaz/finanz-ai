FROM node:22-slim AS build
RUN corepack enable && corepack prepare pnpm@11.0.9 --activate
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/db/package.json packages/db/package.json
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
RUN pnpm install --frozen-lockfile

COPY packages/db packages/db
COPY apps/backend apps/backend

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

RUN pnpm --filter @finanzia/db exec prisma generate
RUN pnpm --filter @finanzia/db run build
RUN pnpm --filter backend run build

COPY apps/backend/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/app/docker-entrypoint.sh"]
