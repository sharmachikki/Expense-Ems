import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApprovalDecision } from '@prisma/client';

export class DecisionDto {
  @IsEnum(ApprovalDecision)
  decision: ApprovalDecision;

  @IsOptional()
  @IsString()
  comment?: string;
}
