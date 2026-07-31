import { Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_USER_ID, prisma } from '@finanzia/db';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountService {
  create(dto: CreateAccountDto) {
    return prisma.account.create({
      data: { name: dto.name, balance: dto.balance ?? 0, userId: DEFAULT_USER_ID },
    });
  }

  findAll() {
    return prisma.account.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const account = await prisma.account.findFirst({
      where: { id, userId: DEFAULT_USER_ID },
    });
    if (!account) {
      throw new NotFoundException(`Account ${id} not found`);
    }
    return account;
  }

  async update(id: string, dto: UpdateAccountDto) {
    await this.findOne(id);
    return prisma.account.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await prisma.account.delete({ where: { id } });
  }
}
