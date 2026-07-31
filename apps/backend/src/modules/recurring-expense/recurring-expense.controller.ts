import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RecurringExpenseService } from './recurring-expense.service';
import { CreateRecurringExpenseDto } from './dto/create-recurring-expense.dto';
import { UpdateRecurringExpenseDto } from './dto/update-recurring-expense.dto';

@Controller('recurring-expense')
export class RecurringExpenseController {
  constructor(private readonly recurringExpenseService: RecurringExpenseService) {}

  @Post()
  create(@Body() dto: CreateRecurringExpenseDto) {
    return this.recurringExpenseService.create(dto);
  }

  @Post('run')
  run() {
    return this.recurringExpenseService.generateDueTransactions();
  }

  @Get()
  findAll() {
    return this.recurringExpenseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recurringExpenseService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRecurringExpenseDto) {
    return this.recurringExpenseService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recurringExpenseService.remove(id);
  }
}
