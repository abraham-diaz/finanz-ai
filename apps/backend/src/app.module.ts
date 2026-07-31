import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { CategoryModule } from './modules/category/category.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AccountModule } from './modules/account/account.module';

@Module({
  imports: [UsersModule, CategoryModule, TransactionModule, DashboardModule, AccountModule],
})
export class AppModule {}
