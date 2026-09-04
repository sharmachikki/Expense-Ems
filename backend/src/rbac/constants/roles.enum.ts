// Mirrors prisma RoleName enum as a plain TS enum so it can be used in
// decorators without importing the Prisma client everywhere.
export enum RoleName {
  SUPER_ADMIN = 'SUPER_ADMIN',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  FINANCE_HEAD = 'FINANCE_HEAD',
  MANAGER = 'MANAGER',
  HOD = 'HOD',
  EMPLOYEE = 'EMPLOYEE',
}

// Menu keys from "Role-Based Menu Visibility & Authorization" §Role & Menu
// Access Rules. EMPLOYEE is intentionally included so canAccessMenu can
// return false for it explicitly (AC-05 / TC-16: the Employee menu must
// never appear), rather than falling through to a default that could later
// be changed to `true` by mistake.
export enum MenuKey {
  MASTERS_POLICY = 'MASTERS_POLICY',
  ACCOUNTING_SYNC = 'ACCOUNTING_SYNC',
  FINANCE_APPROVAL_SETTLEMENT = 'FINANCE_APPROVAL_SETTLEMENT',
  MANAGER_HOD_APPROVALS = 'MANAGER_HOD_APPROVALS',
  EMPLOYEE = 'EMPLOYEE',
}

// Minimal shape the permission function needs. The real request-scoped user
// object (from the JWT strategy) satisfies this plus extra fields.
export interface AuthorizableUser {
  roles: RoleName[];
  isApprovingAuthority: boolean;
}
