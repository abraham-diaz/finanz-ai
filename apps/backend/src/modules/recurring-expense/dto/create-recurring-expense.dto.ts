import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateRecurringExpenseDto {
  @IsNumber()
  amount!: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  @Max(31)
  dayOfMonth!: number;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
