import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_USER_ID, Prisma, prisma } from '@finanzia/db';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

// Prisma error shapes are inconsistent in this version: most constraint violations
// surface as PrismaClientKnownRequestError with a `P####` code, but some (seen on FK
// RESTRICT violations) come through as a raw DriverAdapterError with the Postgres
// SQLSTATE nested in `error.cause.code` instead. Check both shapes to be safe.
function getPostgresErrorCode(error: unknown): string | undefined {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code;
  }
  return (error as { cause?: { code?: string } })?.cause?.code;
}

// Left value is Prisma's own code, right value is the underlying Postgres SQLSTATE —
// see the comment on getPostgresErrorCode above for why both are needed.
const UNIQUE_VIOLATION_CODES = ['P2002', '23505'];
const FOREIGN_KEY_VIOLATION_CODES = ['P2003', '23503', '23001'];

@Injectable()
export class CategoryService {
  async create(dto: CreateCategoryDto) {
    try {
      return await prisma.category.create({
        data: { ...dto, userId: DEFAULT_USER_ID },
      });
    } catch (error) {
      if (UNIQUE_VIOLATION_CODES.includes(getPostgresErrorCode(error) ?? '')) {
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
      if (UNIQUE_VIOLATION_CODES.includes(getPostgresErrorCode(error) ?? '')) {
        throw new ConflictException(`A category named "${dto.name}" already exists`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      await prisma.category.delete({ where: { id } });
    } catch (error) {
      if (FOREIGN_KEY_VIOLATION_CODES.includes(getPostgresErrorCode(error) ?? '')) {
        throw new ConflictException(
          'This category has transactions or recurring expenses assigned to it and cannot be deleted',
        );
      }
      throw error;
    }
  }
}
