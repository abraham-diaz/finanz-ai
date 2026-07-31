import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_USER_ID, Prisma, prisma } from '@finanzia/db';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  async create(dto: CreateCategoryDto) {
    try {
      return await prisma.category.create({
        data: { ...dto, userId: DEFAULT_USER_ID },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`A category named "${dto.name}" already exists`);
      }
      throw error;
    }
  }

  findAll() {
    return prisma.category.findMany({ where: { userId: DEFAULT_USER_ID } });
  }

  async findOne(id: string) {
    const category = await prisma.category.findFirst({
      where: { id, userId: DEFAULT_USER_ID },
    });
    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    try {
      return await prisma.category.update({ where: { id }, data: dto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`A category named "${dto.name}" already exists`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await prisma.category.delete({ where: { id } });
  }
}
