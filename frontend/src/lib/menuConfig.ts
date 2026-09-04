import { MenuKey } from './rbac-constants';

export interface MenuItem {
  key: MenuKey;
  label: string;
  path: string;
  num: string;
}

// Order and labels follow the "Menu Structure" in the architecture doc §7,
// filtered down to the menus the RBAC spec actually governs. Employee is
// deliberately excluded from this list per AC-05 — it must never appear in
// this navigation, so there is no entry here to accidentally render.
export const MENU_ITEMS: MenuItem[] = [
  { key: MenuKey.MASTERS_POLICY, label: 'Masters & Policy', path: '/masters-policy', num: '01' },
  { key: MenuKey.ACCOUNTING_SYNC, label: 'Accounting Sync', path: '/accounting-sync', num: '02' },
  { key: MenuKey.FINANCE_APPROVAL_SETTLEMENT, label: 'Finance Approval & Settlement', path: '/finance-approval', num: '03' },
  { key: MenuKey.MANAGER_HOD_APPROVALS, label: 'Manager / HOD Approvals', path: '/approvals', num: '04' },
];
