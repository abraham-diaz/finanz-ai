#!/bin/sh
set -e

pnpm --filter @finanzia/db exec prisma migrate deploy
pnpm --filter @finanzia/db run seed

exec node apps/backend/dist/main.js
