import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { CategoryModule } from './modules/category/category.module';
import { TransactionModule } from './modules/transaction/transaction.module';

@Module({
  imports: [UsersModule, CategoryModule, TransactionModule],
})
export class AppModule {}
