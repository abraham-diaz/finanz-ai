import { Test, TestingModule } from '@nestjs/testing';
import { RecurringExpenseService } from './recurring-expense.service';

describe('RecurringExpenseService', () => {
  let service: RecurringExpenseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecurringExpenseService],
    }).compile();

    service = module.get<RecurringExpenseService>(RecurringExpenseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
