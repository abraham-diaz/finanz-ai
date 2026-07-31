FROM node:22-slim AS build
RUN corepack enable && corepack prepare pnpm@11.0.9 --activate
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/db/package.json packages/db/package.json
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
RUN pnpm install --frozen-lockfile

COPY apps/frontend apps/frontend

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN pnpm --filter frontend run build

FROM nginx:alpine
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
