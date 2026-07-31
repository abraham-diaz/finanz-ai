import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "./generated/prisma/client";
export type { User, Category, Transaction } from "./generated/prisma/client";
export { Prisma, PrismaClient };
export { TransactionType } from "./generated/prisma/client";
export { DEFAULT_USER_ID } from "./constants";

function findMonorepoRoot(startDir: string): string {
  let dir = startDir;
  while (!fs.existsSync(path.join(dir, "pnpm-workspace.yaml"))) {
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error("Could not locate monorepo root (pnpm-workspace.yaml not found)");
    }
    dir = parent;
  }
  return dir;
}

dotenv.config({ path: path.join(findMonorepoRoot(__dirname), ".env") });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

export const prisma = new PrismaClient({ adapter });