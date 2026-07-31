import { Test, TestingModule } from '@nestjs/testing';
import { RecurringExpenseController } from './recurring-expense.controller';
import { RecurringExpenseService } from './recurring-expense.service';

describe('RecurringExpenseController', () => {
  let controller: RecurringExpenseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecurringExpenseController],
      providers: [RecurringExpenseService],
    }).compile();

    controller = module.get<RecurringExpenseController>(RecurringExpenseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
