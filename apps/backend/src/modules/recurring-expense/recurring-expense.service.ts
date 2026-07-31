import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DEFAULT_USER_ID, prisma } from '@finanzia/db';
import { CreateRecurringExpenseDto } from './dto/create-recurring-expense.dto';
import { UpdateRecurringExpenseDto } from './dto/update-recurring-expense.dto';

@Injectable()
export class RecurringExpenseService {
  private readonly logger = new Logger(RecurringExpenseService.name);

  create(dto: CreateRecurringExpenseDto) {
    return prisma.recurringExpense.create({
      data: {
        amount: dto.amount,
        description: dto.description,
        dayOfMonth: dto.dayOfMonth,
        categoryId: dto.categoryId,
        active: dto.active,
        userId: DEFAULT_USER_ID,
      },
    });
  }

  findAll() {
    return prisma.recurringExpense.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { dayOfMonth: 'asc' },
    });
  }

  async findOne(id: string) {
    const recurringExpense = await prisma.recurringExpense.findFirst({
      where: { id, userId: DEFAULT_USER_ID },
    });
    if (!recurringExpense) {
      throw new NotFoundException(`Recurring expense ${id} not found`);
    }
    return recurringExpense;
  }

  async update(id: string, dto: UpdateRecurringExpenseDto) {
    await this.findOne(id);
    return prisma.recurringExpense.update({
      where: { id },
      data: {
        amount: dto.amount,
        description: dto.description,
        dayOfMonth: dto.dayOfMonth,
        categoryId: dto.categoryId,
        active: dto.active,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await prisma.recurringExpense.delete({ where: { id } });
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async generateDueTransactions() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const currentMonth = `${year}-${String(month + 1).padStart(2, '0')}`;

    const due = await prisma.recurringExpense.findMany({
      where: { userId: DEFAULT_USER_ID, active: true },
    });

    for (const expense of due) {
      if (expense.lastGeneratedMonth === currentMonth) continue;

      const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      const effectiveDay = Math.min(expense.dayOfMonth, daysInMonth);
      if (now.getUTCDate() < effectiveDay) continue;

      await prisma.transaction.create({
        data: {
          amount: expense.amount,
          description: expense.description,
          date: new Date(Date.UTC(year, month, effectiveDay)),
          transactionType: 'EXPENSE',
          categoryId: expense.categoryId,
          userId: DEFAULT_USER_ID,
        },
      });

      await prisma.recurringExpense.update({
        where: { id: expense.id },
        data: { lastGeneratedMonth: currentMonth },
      });

      this.logger.log(`Generated transaction for recurring expense ${expense.id}`);
    }
  }
}
