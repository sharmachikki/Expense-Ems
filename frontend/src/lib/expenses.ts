import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

export type ExpenseStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'MANAGER_APPROVED'
  | 'HOD_APPROVED'
  | 'FINANCE_APPROVED'
  | 'SETTLED'
  | 'REJECTED'
  | 'DISPUTED';

export interface ExpenseItemInput {
  description: string;
  category?: string;
  amount: number;
  date: string;
}

export interface Expense {
  id: string;
  purpose: string;
  payTo: string | null;
  totalAmount: string;
  status: ExpenseStatus;
  submittedAt: string | null;
  createdAt: string;
  items: (ExpenseItemInput & { id: string })[];
  employee?: { id: string; fullName: string; email: string };
}

// --- Employee: my own expenses ---

export function useMyExpenses() {
  return useQuery({
    queryKey: ['expenses', 'mine'],
    queryFn: async () => (await api.get<Expense[]>('/expenses/mine')).data,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { purpose: string; payTo?: string; items: ExpenseItemInput[] }) =>
      (await api.post<Expense>('/expenses', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses', 'mine'] }),
  });
}

export function useSubmitExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.patch<Expense>(`/expenses/${id}/submit`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses', 'mine'] }),
  });
}

// --- Manager / HOD Approvals ---

export function usePendingApproval() {
  return useQuery({
    queryKey: ['expenses', 'pending-approval'],
    queryFn: async () => (await api.get<Expense[]>('/expenses/pending-approval')).data,
  });
}

export function useApprovalDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, decision, comment }: { id: string; decision: 'APPROVED' | 'REJECTED'; comment?: string }) =>
      (await api.patch<Expense>(`/expenses/${id}/approval-decision`, { decision, comment })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses', 'pending-approval'] }),
  });
}

// --- Finance Approval & Settlement ---

export function usePendingFinance() {
  return useQuery({
    queryKey: ['expenses', 'pending-finance'],
    queryFn: async () => (await api.get<Expense[]>('/expenses/pending-finance')).data,
  });
}

export function useFinanceDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, decision, comment }: { id: string; decision: 'APPROVED' | 'REJECTED'; comment?: string }) =>
      (await api.patch<Expense>(`/expenses/${id}/finance-decision`, { decision, comment })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses', 'pending-finance'] }),
  });
}
