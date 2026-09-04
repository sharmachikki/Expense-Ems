import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MenuGuard } from '../rbac/guards/menu.guard';
import { RequireMenu } from '../rbac/decorators/require-menu.decorator';
import { MenuKey } from '../rbac/constants/roles.enum';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { DecisionDto } from './dto/decision.dto';

@UseGuards(JwtAuthGuard, MenuGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  // Creating/submitting/viewing your own expenses isn't gated by any of the
  // four RBAC menus — every authenticated user (including a plain
  // Employee, who has none of those menus) can file an expense claim.
  @Post()
  create(@Req() req: Request, @Body() dto: CreateExpenseDto) {
    return this.expensesService.create((req.user as any).id, dto);
  }

  @Get('mine')
  listMine(@Req() req: Request) {
    return this.expensesService.listMine((req.user as any).id);
  }

  @Patch(':id/submit')
  submit(@Req() req: Request, @Param('id') id: string) {
    return this.expensesService.submit((req.user as any).id, id);
  }

  // --- Manager / HOD Approvals (gated on isApprovingAuthority) ---

  @RequireMenu(MenuKey.MANAGER_HOD_APPROVALS)
  @Get('pending-approval')
  listPendingApproval() {
    return this.expensesService.listPendingApproval();
  }

  @RequireMenu(MenuKey.MANAGER_HOD_APPROVALS)
  @Patch(':id/approval-decision')
  decideApproval(@Req() req: Request, @Param('id') id: string, @Body() dto: DecisionDto) {
    return this.expensesService.decideApproval((req.user as any).id, id, dto.decision, dto.comment);
  }

  // --- Finance Approval & Settlement (gated on FINANCE_HEAD role) ---

  @RequireMenu(MenuKey.FINANCE_APPROVAL_SETTLEMENT)
  @Get('pending-finance')
  listPendingFinance() {
    return this.expensesService.listPendingFinance();
  }

  @RequireMenu(MenuKey.FINANCE_APPROVAL_SETTLEMENT)
  @Patch(':id/finance-decision')
  decideFinance(@Req() req: Request, @Param('id') id: string, @Body() dto: DecisionDto) {
    return this.expensesService.decideFinance((req.user as any).id, id, dto.decision, dto.comment);
  }
}
