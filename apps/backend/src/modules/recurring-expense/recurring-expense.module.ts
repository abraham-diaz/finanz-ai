import { Module } from '@nestjs/common';
import { RecurringExpenseController } from './recurring-expense.controller';
import { RecurringExpenseService } from './recurring-expense.service';

@Module({
  controllers: [RecurringExpenseController],
  providers: [RecurringExpenseService],
})
export class RecurringExpenseModule {}
