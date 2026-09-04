import { ExpenseStatus } from './expenses';

export const STATUS_PILL: Record<ExpenseStatus, { color: 'green' | 'amber' | 'red' | 'slate' | 'purple' | 'teal'; label: string }> = {
  DRAFT: { color: 'slate', label: 'Draft' },
  SUBMITTED: { color: 'amber', label: 'Submitted' },
  MANAGER_APPROVED: { color: 'teal', label: 'Manager/HOD Approved' },
  HOD_APPROVED: { color: 'teal', label: 'HOD Approved' },
  FINANCE_APPROVED: { color: 'green', label: 'Finance Approved' },
  SETTLED: { color: 'green', label: 'Settled' },
  REJECTED: { color: 'red', label: 'Rejected' },
  DISPUTED: { color: 'purple', label: 'Disputed' },
};
