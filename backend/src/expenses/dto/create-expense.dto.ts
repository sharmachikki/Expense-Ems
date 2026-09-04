import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class ExpenseItemDto {
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsDateString()
  date: string;
}

export class CreateExpenseDto {
  @IsString()
  purpose: string;

  @IsOptional()
  @IsString()
  payTo?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ExpenseItemDto)
  items: ExpenseItemDto[];
}
