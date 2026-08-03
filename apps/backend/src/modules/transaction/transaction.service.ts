import { Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_USER_ID, prisma, TransactionType } from '@finanzia/db';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

function balanceEffect(amount: number, type: TransactionType): number {
  return type === TransactionType.INCOME ? amount : -amount;
}

@Injectable()
export class TransactionService {
  create(dto: CreateTransactionDto) {
    return prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          amount: dto.amount,
          description: dto.description,
          date: new Date(dto.date),
          transactionType: dto.transactionType,
          categoryId: dto.categoryId,
          accountId: dto.accountId,
          userId: DEFAULT_USER_ID,
        },
      });
      await tx.account.update({
        where: { id: dto.accountId },
        data: { balance: { increment: balanceEffect(dto.amount, dto.transactionType) } },
      });
      return transaction;
    });
  }

  findAll(categoryIds?: string[]) {
    return prisma.transaction.findMany({
      where: {
        userId: DEFAULT_USER_ID,
        ...(categoryIds && categoryIds.length > 0 ? { categoryId: { in: categoryIds } } : {}),
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: DEFAULT_USER_ID },
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }
    return transaction;
  }

  async update(id: string, dto: UpdateTransactionDto) {
    const existing = await this.findOne(id);
    return prisma.$transaction(async (tx) => {
      if (existing.accountId) {
        await tx.account.update({
          where: { id: existing.accountId },
          data: {
            balance: { increment: -balanceEffect(existing.amount, existing.transactionType) },
          },
        });
      }

      const updated = await tx.transaction.update({
        where: { id },
        data: {
          amount: dto.amount,
          description: dto.description,
          date: dto.date ? new Date(dto.date) : undefined,
          transactionType: dto.transactionType,
          categoryId: dto.categoryId,
          accountId: dto.accountId,
        },
      });

      const newAccountId = dto.accountId ?? existing.accountId;
      if (newAccountId) {
        await tx.account.update({
          where: { id: newAccountId },
          data: {
            balance: { increment: balanceEffect(updated.amount, updated.transactionType) },
          },
        });
      }

      return updated;
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    await prisma.$transaction(async (tx) => {
      if (existing.accountId) {
        await tx.account.update({
          where: { id: existing.accountId },
          data: {
            balance: { increment: -balanceEffect(existing.amount, existing.transactionType) },
          },
        });
      }
      await tx.transaction.delete({ where: { id } });
    });
  }
}
