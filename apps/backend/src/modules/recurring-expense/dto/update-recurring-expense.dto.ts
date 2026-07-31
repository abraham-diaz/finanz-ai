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

export class UpdateRecurringExpenseDto {
  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  dayOfMonth?: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  categoryId?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
