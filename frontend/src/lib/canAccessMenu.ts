import { AuthorizableUser, MenuKey, RoleName } from './rbac-constants';

/**
 * UI-visibility mirror of backend/src/rbac/menu-permission.service.ts.
 *
 * IMPORTANT: this function controls what renders, nothing more. It is
 * never the security boundary — every API call this app makes is
 * independently re-checked by the backend's MenuGuard (AC-08), and a user
 * who edits localStorage/app state to flip a flag still gets a 403 from
 * the API and a redirect from ProtectedRoute (AC-07). If you change the
 * access rules, change menu-permission.service.ts first and port the same
 * change here — never the other way around.
 */
export function canAccessMenu(user: AuthorizableUser, menu: MenuKey): boolean {
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
      // Independent of role — do not add role checks here.
      return user.isApprovingAuthority === true;

    case MenuKey.EMPLOYEE:
      return false;

    default:
      return false;
  }
}
