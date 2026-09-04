import { Injectable } from '@nestjs/common';
import { AuthorizableUser, MenuKey, RoleName } from './constants/roles.enum';

/**
 * Central, backend-enforced authorization logic for the role/menu matrix in
 * "Role-Based Menu Visibility & Authorization". This is deliberately the
 * ONLY place that encodes the access rules — the frontend's canAccessMenu()
 * (frontend/src/lib/canAccessMenu.ts) mirrors this for UI hiding, but every
 * protected route must call this service (via MenuGuard) independently.
 * Frontend menu hiding is never treated as sufficient authorization (AC-08).
 */
@Injectable()
export class MenuPermissionService {
  /**
   * Returns whether `user` may access `menu`.
   *
   * Safe-by-default: unknown menu keys, users with no roles, unknown role
   * strings, and missing/null isApprovingAuthority all resolve to `false`
   * rather than throwing or falling through to an allow — this is what
   * keeps edge cases (no role assigned, invalid role, stale token, null
   * approval flag) from accidentally granting access.
   */
  canAccessMenu(user: AuthorizableUser, menu: MenuKey): boolean {
    const roles = user.roles ?? [];
    const hasRole = (r: RoleName) => roles.includes(r);

    switch (menu) {
      case MenuKey.MASTERS_POLICY:
        return hasRole(RoleName.COMPANY_ADMIN) || hasRole(RoleName.SUPER_ADMIN);

      case MenuKey.ACCOUNTING_SYNC:
        return hasRole(RoleName.COMPANY_ADMIN) || hasRole(RoleName.FINANCE_HEAD);

      case MenuKey.FINANCE_APPROVAL_SETTLEMENT:
        return hasRole(RoleName.FINANCE_HEAD);

      case MenuKey.MANAGER_HOD_APPROVALS:
        // Independent of primary role by design — do not add role checks here.
        return user.isApprovingAuthority === true;

      case MenuKey.EMPLOYEE:
        // Never shown in this navigation (AC-05), regardless of role.
        return false;

      default:
        return false;
    }
  }

  /** Convenience helper for building a nav payload or a frontend bootstrap response. */
  getVisibleMenus(user: AuthorizableUser): MenuKey[] {
    return Object.values(MenuKey).filter((menu) => this.canAccessMenu(user, menu));
  }
}
