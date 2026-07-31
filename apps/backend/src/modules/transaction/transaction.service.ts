import { Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_USER_ID, prisma } from '@finanzia/db';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionService {
  create(dto: CreateTransactionDto) {
    return prisma.transaction.create({
      data: {
        amount: dto.amount,
        description: dto.description,
        date: new Date(dto.date),
        transactionType: dto.transactionType,
        categoryId: dto.categoryId,
        userId: DEFAULT_USER_ID,
      },
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
    await this.findOne(id);
    return prisma.transaction.update({
      where: { id },
      data: {
        amount: dto.amount,
        description: dto.description,
        date: dto.date ? new Date(dto.date) : undefined,
        transactionType: dto.transactionType,
        categoryId: dto.categoryId,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await prisma.transaction.delete({ where: { id } });
  }
}
