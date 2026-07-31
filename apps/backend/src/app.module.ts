import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './modules/users/users.module';
import { CategoryModule } from './modules/category/category.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AccountModule } from './modules/account/account.module';
import { RecurringExpenseModule } from './modules/recurring-expense/recurring-expense.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    UsersModule,
    CategoryModule,
    TransactionModule,
    DashboardModule,
    AccountModule,
    RecurringExpenseModule,
  ],
})
export class AppModule {}
