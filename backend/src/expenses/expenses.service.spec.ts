import { ApprovalDecision, ExpenseStatus } from '@prisma/client';
import { ExpensesService } from './expenses.service';

// Minimal in-memory fake standing in for PrismaService, just enough to
// exercise the status transitions in ExpensesService without a real DB.
function makeFakePrisma(initialStatus: ExpenseStatus) {
  const expense = { id: 'exp_1', employeeId: 'emp_1', status: initialStatus };
  const approvals: any[] = [];

  return {
    state: expense,
    approvals,
    expense: {
      findUnique: async () => ({ ...expense }),
      update: async ({ data }: any) => {
        Object.assign(expense, data);
        return { ...expense };
      },
    },
    expenseApproval: {
      create: async ({ data }: any) => {
        approvals.push(data);
        return data;
      },
    },
    $transaction: async (ops: Promise<any>[]) => Promise.all(ops),
  } as any;
}

describe('ExpensesService approval pipeline', () => {
  it('SUBMITTED --approve--> MANAGER_APPROVED', async () => {
    const prisma = makeFakePrisma(ExpenseStatus.SUBMITTED);
    const svc = new ExpensesService(prisma);
    const result = await svc.decideApproval('mgr_1', 'exp_1', ApprovalDecision.APPROVED);
    expect(result.status).toBe(ExpenseStatus.MANAGER_APPROVED);
  });

  it('SUBMITTED --reject--> REJECTED', async () => {
    const prisma = makeFakePrisma(ExpenseStatus.SUBMITTED);
    const svc = new ExpensesService(prisma);
    const result = await svc.decideApproval('mgr_1', 'exp_1', ApprovalDecision.REJECTED, 'missing receipts');
    expect(result.status).toBe(ExpenseStatus.REJECTED);
  });

  it('rejects a Manager/HOD decision on an expense not in SUBMITTED', async () => {
    const prisma = makeFakePrisma(ExpenseStatus.DRAFT);
    const svc = new ExpensesService(prisma);
    await expect(svc.decideApproval('mgr_1', 'exp_1', ApprovalDecision.APPROVED)).rejects.toThrow(
      /not awaiting Manager\/HOD approval/,
    );
  });

  it('MANAGER_APPROVED --finance approve--> FINANCE_APPROVED', async () => {
    const prisma = makeFakePrisma(ExpenseStatus.MANAGER_APPROVED);
    const svc = new ExpensesService(prisma);
    const result = await svc.decideFinance('fin_1', 'exp_1', ApprovalDecision.APPROVED);
    expect(result.status).toBe(ExpenseStatus.FINANCE_APPROVED);
  });

  it('rejects a Finance decision before Manager/HOD has approved', async () => {
    const prisma = makeFakePrisma(ExpenseStatus.SUBMITTED);
    const svc = new ExpensesService(prisma);
    await expect(svc.decideFinance('fin_1', 'exp_1', ApprovalDecision.APPROVED)).rejects.toThrow(
      /not awaiting Finance approval/,
    );
  });

  it('a user cannot submit another employee\u2019s expense', async () => {
    const prisma = makeFakePrisma(ExpenseStatus.DRAFT);
    const svc = new ExpensesService(prisma);
    await expect(svc.submit('someone_else', 'exp_1')).rejects.toThrow(/only submit your own/);
  });
});
