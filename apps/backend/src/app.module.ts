import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { CategoryModule } from './modules/category/category.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [UsersModule, CategoryModule, TransactionModule, AuthModule],
})
export class AppModule {}
