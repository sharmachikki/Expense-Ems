// Mirrors backend/src/rbac/constants/roles.enum.ts. Keep these two files
// in sync by hand — see the note in canAccessMenu.ts for why this mirror
// exists at all instead of being the sole source of truth.
export enum RoleName {
  SUPER_ADMIN = 'SUPER_ADMIN',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  FINANCE_HEAD = 'FINANCE_HEAD',
  MANAGER = 'MANAGER',
  HOD = 'HOD',
  EMPLOYEE = 'EMPLOYEE',
}

export enum MenuKey {
  MASTERS_POLICY = 'MASTERS_POLICY',
  ACCOUNTING_SYNC = 'ACCOUNTING_SYNC',
  FINANCE_APPROVAL_SETTLEMENT = 'FINANCE_APPROVAL_SETTLEMENT',
  MANAGER_HOD_APPROVALS = 'MANAGER_HOD_APPROVALS',
  EMPLOYEE = 'EMPLOYEE',
}

export interface AuthorizableUser {
  roles: RoleName[];
  isApprovingAuthority: boolean;
}
