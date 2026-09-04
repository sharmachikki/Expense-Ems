import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ApprovalDecision, ExpenseStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

/**
 * Approval pipeline (per the architecture doc's "Employee → Manager → HOD →
 * Finance" flow, expressed through the two RBAC-governed stages that
 * actually gate menus in the spec):
 *
 *   DRAFT --submit--> SUBMITTED --approve (Manager/HOD Approvals)--> MANAGER_APPROVED
 *   MANAGER_APPROVED --approve (Finance Approval & Settlement)--> FINANCE_APPROVED
 *   FINANCE_APPROVED --settle--> SETTLED
 *   (any stage) --reject--> REJECTED
 *
 * "Manager/HOD Approvals" is intentionally one stage here rather than two,
 * matching the menu structure in the RBAC spec — it doesn't distinguish a
 * separate Manager step from a separate HOD step, only "any Approving
 * Authority". Splitting that further (e.g. sequential Manager-then-HOD) is
 * a product decision to make before this ships; the schema's `stage` field
 * on ExpenseApproval already supports recording either as a distinct value
 * if you add that later.
 */
@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(employeeId: string, dto: CreateExpenseDto) {
    const totalAmount = dto.items.reduce((sum, item) => sum + item.amount, 0);

    return this.prisma.expense.create({
      data: {
        employeeId,
        branchId: dto.branchId,
        purpose: dto.purpose,
        payTo: dto.payTo,
        totalAmount,
        status: ExpenseStatus.DRAFT,
        items: {
          create: dto.items.map((item) => ({
            description: item.description,
            category: item.category,
            amount: item.amount,
            date: new Date(item.date),
          })),
        },
      },
      include: { items: true },
    });
  }

  async listMine(employeeId: string) {
    return this.prisma.expense.findMany({
      where: { employeeId },
      include: { items: true, approvals: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async submit(employeeId: string, expenseId: string) {
    const expense = await this.mustFind(expenseId);
    if (expense.employeeId !== employeeId) {
      throw new ForbiddenException('You can only submit your own expenses.');
    }
    if (expense.status !== ExpenseStatus.DRAFT) {
      throw new BadRequestException(`Cannot submit an expense in status ${expense.status}.`);
    }
    return this.prisma.expense.update({
      where: { id: expenseId },
      data: { status: ExpenseStatus.SUBMITTED, submittedAt: new Date() },
    });
  }

  // Queue for anyone with isApprovingAuthority (Manager/HOD Approvals menu).
  // A scoped deployment would additionally filter by reporting hierarchy —
  // left as a TODO since the spec doesn't define that hierarchy.
  async listPendingApproval() {
    return this.prisma.expense.findMany({
      where: { status: ExpenseStatus.SUBMITTED },
      include: { items: true, employee: { select: { id: true, fullName: true, email: true } } },
      orderBy: { submittedAt: 'asc' },
    });
  }

  async decideApproval(actorId: string, expenseId: string, decision: ApprovalDecision, comment?: string) {
    const expense = await this.mustFind(expenseId);
    if (expense.status !== ExpenseStatus.SUBMITTED) {
      throw new BadRequestException(`Expense is in status ${expense.status}, not awaiting Manager/HOD approval.`);
    }
    return this.applyDecision(expense.id, actorId, 'MANAGER_HOD', decision, comment, {
      [ApprovalDecision.APPROVED]: ExpenseStatus.MANAGER_APPROVED,
      [ApprovalDecision.REJECTED]: ExpenseStatus.REJECTED,
      [ApprovalDecision.RETURNED]: ExpenseStatus.DRAFT,
    });
  }

  // Queue for Finance Head (Finance Approval & Settlement menu).
  async listPendingFinance() {
    return this.prisma.expense.findMany({
      where: { status: ExpenseStatus.MANAGER_APPROVED },
      include: { items: true, employee: { select: { id: true, fullName: true, email: true } } },
      orderBy: { submittedAt: 'asc' },
    });
  }

  async decideFinance(actorId: string, expenseId: string, decision: ApprovalDecision, comment?: string) {
    const expense = await this.mustFind(expenseId);
    if (expense.status !== ExpenseStatus.MANAGER_APPROVED) {
      throw new BadRequestException(`Expense is in status ${expense.status}, not awaiting Finance approval.`);
    }
    return this.applyDecision(expense.id, actorId, 'FINANCE', decision, comment, {
      [ApprovalDecision.APPROVED]: ExpenseStatus.FINANCE_APPROVED,
      [ApprovalDecision.REJECTED]: ExpenseStatus.REJECTED,
      [ApprovalDecision.RETURNED]: ExpenseStatus.MANAGER_APPROVED,
    });
  }

  private async applyDecision(
    expenseId: string,
    actorId: string,
    stage: string,
    decision: ApprovalDecision,
    comment: string | undefined,
    nextStatus: Record<ApprovalDecision, ExpenseStatus>,
  ) {
    const [, updated] = await this.prisma.$transaction([
      this.prisma.expenseApproval.create({
        data: { expenseId, actorId, stage, decision, comment },
      }),
      this.prisma.expense.update({
        where: { id: expenseId },
        data: { status: nextStatus[decision] },
      }),
    ]);
    return updated;
  }

  private async mustFind(expenseId: string) {
    const expense = await this.prisma.expense.findUnique({ where: { id: expenseId } });
    if (!expense) throw new NotFoundException('Expense not found.');
    return expense;
  }
}
