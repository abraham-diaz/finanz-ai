<div align="center">

# finanz-ai

### Self-hosted personal finance tracker

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma_7-2D3748?style=for-the-badge&logo=prisma&logoColor=white) ![Tailwind](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white) ![pnpm](https://img.shields.io/badge/pnpm_workspaces-F69220?style=for-the-badge&logo=pnpm&logoColor=white)

</div>

---

## What is finanz-ai?

finanz-ai is a single-user, self-hosted personal finance tracker. It's built for one person to log income and expenses from their phone, see where the money goes each month, and keep account balances up to date — no bank integration, no login screen, just a fast mobile dashboard running on your own hardware.

---

## Features

- **Dashboard** — monthly income/expense/balance summary, % change vs. the previous month, and a cumulative running-balance area chart
- **Add income or expense** — a speed-dial "+" button on the home screen lets you log a transaction against an account and category; the account's balance is updated automatically (increment on income, decrement on expense — including on edit/delete)
- **Accounts** — manually created "wallets" (cash, bank, savings...) with balances that stay in sync with recorded transactions
- **Categories** — CRUD with a custom icon picker
- **Expense breakdown** — spending by category, with icons, for the current month
- **Category filter** — browse transactions filtered by one or more categories
- **Recurring expenses** — define an amount and a day of the month; a daily cron job generates the transaction automatically once it's due
- **Customizable dashboard** — reorder widgets from Settings (up/down, no drag-and-drop), order persisted in `localStorage`
- **No auth, on purpose** — every query is scoped to a single fixed `DEFAULT_USER_ID`; access control is the Tailscale network, not a login form
- **Mobile-first** — single column, `max-w-md` layout, designed to be used from a phone

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 · Vite · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix + Lucide) |
| Backend | NestJS |
| ORM | Prisma 7 (driver adapter, CommonJS client) |
| Database | PostgreSQL |
| Scheduling | `@nestjs/schedule` (cron, for recurring expenses) |
| Monorepo | pnpm workspaces |
| Deployment | Docker Compose, on a Raspberry Pi behind Tailscale |

---

## Data Model

```
User (single row, DEFAULT_USER_ID)
├─ Account          name, balance
├─ Category         name, icon
│  └─ Transaction    amount, date, INCOME | EXPENSE
│     └─ Account     optional — balance is adjusted automatically on create/update/delete
└─ RecurringExpense  amount, dayOfMonth → generates a Transaction each month (cron)
```

---

## Structure

```
finanz-ai/
├─ apps/
│  ├─ backend/               NestJS API
│  │  └─ src/modules/
│  │     ├─ account/         Accounts, balances adjusted by transactions
│  │     ├─ category/        Category CRUD
│  │     ├─ transaction/     Income/expense records
│  │     ├─ recurring-expense/  Cron-generated monthly expenses
│  │     └─ dashboard/       Aggregated summary for the current month
│  └─ frontend/               React + Vite SPA
│     └─ src/
│        ├─ components/      Dashboard widgets, settings, add-transaction sheet
│        └─ lib/             API client, dashboard widget order, formatting
└─ packages/
   └─ db/                    Prisma schema, generated client, DEFAULT_USER_ID
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm
- PostgreSQL

### Setup

**1. Install dependencies:**

```bash
pnpm install
```

**2. Configure the database** — create `.env` at the repo root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/finanzia"
```

**3. Apply the schema:**

```bash
cd packages/db
pnpm exec prisma migrate dev
```

**4. Seed the default user:**

```bash
pnpm --filter @finanzia/db run seed
```

**5. Start development:**

```bash
pnpm dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:3000`.

---

## Production

Deployed via Docker Compose — a NestJS container and an nginx-served static frontend, both expecting an external PostgreSQL reachable on the `shared-postgres-net` network:

```bash
DATABASE_URL="postgresql://user:password@host:5432/finanzia" \
VITE_API_URL="http://your-tailscale-host:3010" \
docker compose up -d --build
```

Backend is exposed on `3010`, frontend on `8090`. There's no auth layer — the app is meant to be reached only over Tailscale.

---

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Build `@finanzia/db` and start backend + frontend in watch mode |
| `pnpm --filter @finanzia/db run build` | Rebuild the shared db package (needed after any schema/index change) |
| `pnpm --filter @finanzia/db run seed` | Create the default single `User` row |
| `pnpm exec prisma migrate dev --name X` *(from `packages/db`)* | Create and apply a schema migration |
| `pnpm exec prisma studio` *(from `packages/db`)* | Open Prisma Studio |
| `pnpm --filter frontend run build` | Build the frontend for production |
| `pnpm --filter frontend run lint` | Lint the frontend (oxlint) |
| `pnpm --filter backend run start:prod` | Run the built backend |

---

## License

Private project — personal use only.
