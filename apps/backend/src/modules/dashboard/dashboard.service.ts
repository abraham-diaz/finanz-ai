import { Injectable } from '@nestjs/common';
import { DEFAULT_USER_ID, prisma, TransactionType } from '@finanzia/db';

const DAY_MS = 24 * 60 * 60 * 1000;

function getMonthRange(month?: string): { start: Date; end: Date } {
  const now = new Date();
  const [year, monthIndex] = month
    ? (month.split('-').map(Number) as [number, number])
    : [now.getUTCFullYear(), now.getUTCMonth() + 1];
  const start = new Date(Date.UTC(year, monthIndex - 1, 1));
  const end = new Date(Date.UTC(year, monthIndex, 1));
  return { start, end };
}

function getPreviousMonthRange(start: Date): { start: Date; end: Date } {
  const prevStart = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - 1, 1));
  const prevEnd = start;
  return { start: prevStart, end: prevEnd };
}

async function sumByType(dateFilter: { gte: Date; lt: Date }, transactionType: TransactionType) {
  const result = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: { userId: DEFAULT_USER_ID, transactionType, date: dateFilter },
  });
  return result._sum.amount ?? 0;
}

export interface DailyBalancePoint {
  date: string;
  balance: number;
}

async function buildDailyBalance(
  start: Date,
  end: Date,
  accountsBalance: number,
): Promise<DailyBalancePoint[]> {
  const today = new Date();
  const lastMoment = new Date(Math.min(end.getTime() - DAY_MS, today.getTime()));
  if (lastMoment < start) return [];

  const transactions = await prisma.transaction.findMany({
    where: { userId: DEFAULT_USER_ID, date: { gte: start, lte: lastMoment } },
    select: { date: true, amount: true, transactionType: true },
  });

  const netByDay = new Map<number, number>();
  for (const transaction of transactions) {
    const dayOffset = Math.floor((transaction.date.getTime() - start.getTime()) / DAY_MS);
    const signed = transaction.transactionType === TransactionType.INCOME
      ? transaction.amount
      : -transaction.amount;
    netByDay.set(dayOffset, (netByDay.get(dayOffset) ?? 0) + signed);
  }

  const totalDays = Math.floor((lastMoment.getTime() - start.getTime()) / DAY_MS) + 1;
  const points: DailyBalancePoint[] = [];
  let cumulative = accountsBalance;
  for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
    cumulative += netByDay.get(dayOffset) ?? 0;
    const date = new Date(start.getTime() + dayOffset * DAY_MS);
    points.push({ date: date.toISOString().slice(0, 10), balance: cumulative });
  }
  return points;
}

@Injectable()
export class DashboardService {
  async getSummary(month?: string) {
    const { start, end } = getMonthRange(month);
    const dateFilter = { gte: start, lt: end };
    const previousRange = getPreviousMonthRange(start);
    const previousDateFilter = { gte: previousRange.start, lt: previousRange.end };

    const [
      income,
      expense,
      previousIncome,
      previousExpense,
      byCategoryRaw,
      categories,
      accountsBalanceResult,
    ] = await Promise.all([
      sumByType(dateFilter, TransactionType.INCOME),
      sumByType(dateFilter, TransactionType.EXPENSE),
      sumByType(previousDateFilter, TransactionType.INCOME),
      sumByType(previousDateFilter, TransactionType.EXPENSE),
      prisma.transaction.groupBy({
        by: ['categoryId'],
        _sum: { amount: true },
        where: { userId: DEFAULT_USER_ID, transactionType: TransactionType.EXPENSE, date: dateFilter },
      }),
      prisma.category.findMany({ where: { userId: DEFAULT_USER_ID } }),
      prisma.account.aggregate({ _sum: { balance: true }, where: { userId: DEFAULT_USER_ID } }),
    ]);

    const accountsBalance = accountsBalanceResult._sum.balance ?? 0;
    const dailyBalance = await buildDailyBalance(start, end, accountsBalance);

    const categoryById = new Map(categories.map((category) => [category.id, category]));
    const byCategory = byCategoryRaw
      .map((row) => ({
        categoryId: row.categoryId,
        categoryName: categoryById.get(row.categoryId)?.name ?? 'Sin categoría',
        icon: categoryById.get(row.categoryId)?.icon ?? null,
        total: row._sum.amount ?? 0,
      }))
      .sort((a, b) => b.total - a.total);

    const balance = accountsBalance + income - expense;
    const previousBalance = accountsBalance + previousIncome - previousExpense;
    const balanceChangePercent = previousBalance !== 0
      ? ((balance - previousBalance) / Math.abs(previousBalance)) * 100
      : null;

    return {
      month: `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, '0')}`,
      income,
      expense,
      balance,
      balanceChangePercent,
      dailyBalance,
      byCategory,
    };
  }
}
