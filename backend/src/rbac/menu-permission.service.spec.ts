import { MenuPermissionService } from './menu-permission.service';
import { MenuKey, RoleName } from './constants/roles.enum';

describe('MenuPermissionService (Role-Based Menu Visibility spec, TC-01..TC-11)', () => {
  const svc = new MenuPermissionService();

  it('TC-01 Company Admin: Masters & Policy + Accounting Sync visible', () => {
    const u = { roles: [RoleName.COMPANY_ADMIN], isApprovingAuthority: false };
    expect(svc.canAccessMenu(u, MenuKey.MASTERS_POLICY)).toBe(true);
    expect(svc.canAccessMenu(u, MenuKey.ACCOUNTING_SYNC)).toBe(true);
    expect(svc.canAccessMenu(u, MenuKey.FINANCE_APPROVAL_SETTLEMENT)).toBe(false);
  });

  it('TC-02 Super Admin: Masters & Policy visible, Accounting Sync not', () => {
    const u = { roles: [RoleName.SUPER_ADMIN], isApprovingAuthority: false };
    expect(svc.canAccessMenu(u, MenuKey.MASTERS_POLICY)).toBe(true);
    expect(svc.canAccessMenu(u, MenuKey.ACCOUNTING_SYNC)).toBe(false);
  });

  it('TC-03 Finance Head: Accounting Sync + Finance Approval & Settlement visible', () => {
    const u = { roles: [RoleName.FINANCE_HEAD], isApprovingAuthority: false };
    expect(svc.canAccessMenu(u, MenuKey.ACCOUNTING_SYNC)).toBe(true);
    expect(svc.canAccessMenu(u, MenuKey.FINANCE_APPROVAL_SETTLEMENT)).toBe(true);
    expect(svc.canAccessMenu(u, MenuKey.MASTERS_POLICY)).toBe(false);
  });

  it('TC-04 Regular Employee: nothing restricted is visible', () => {
    const u = { roles: [RoleName.EMPLOYEE], isApprovingAuthority: false };
    for (const menu of Object.values(MenuKey)) {
      expect(svc.canAccessMenu(u, menu)).toBe(false);
    }
  });

  it('TC-05 Manager + Approving Authority: Manager/HOD Approvals visible', () => {
    const u = { roles: [RoleName.MANAGER], isApprovingAuthority: true };
    expect(svc.canAccessMenu(u, MenuKey.MANAGER_HOD_APPROVALS)).toBe(true);
  });

  it('TC-06 HOD + Approving Authority: Manager/HOD Approvals visible', () => {
    const u = { roles: [RoleName.HOD], isApprovingAuthority: true };
    expect(svc.canAccessMenu(u, MenuKey.MANAGER_HOD_APPROVALS)).toBe(true);
  });

  it('TC-07 Finance Head + Approving Authority: finance menus + Manager/HOD Approvals', () => {
    const u = { roles: [RoleName.FINANCE_HEAD], isApprovingAuthority: true };
    expect(svc.canAccessMenu(u, MenuKey.ACCOUNTING_SYNC)).toBe(true);
    expect(svc.canAccessMenu(u, MenuKey.FINANCE_APPROVAL_SETTLEMENT)).toBe(true);
    expect(svc.canAccessMenu(u, MenuKey.MANAGER_HOD_APPROVALS)).toBe(true);
  });

  it('TC-08 Company Admin + Approving Authority: admin menus + Manager/HOD Approvals', () => {
    const u = { roles: [RoleName.COMPANY_ADMIN], isApprovingAuthority: true };
    expect(svc.canAccessMenu(u, MenuKey.MASTERS_POLICY)).toBe(true);
    expect(svc.canAccessMenu(u, MenuKey.ACCOUNTING_SYNC)).toBe(true);
    expect(svc.canAccessMenu(u, MenuKey.MANAGER_HOD_APPROVALS)).toBe(true);
  });

  it('TC-09 Employee + Approving Authority: Manager/HOD Approvals visible, Employee menu never', () => {
    const u = { roles: [RoleName.EMPLOYEE], isApprovingAuthority: true };
    expect(svc.canAccessMenu(u, MenuKey.MANAGER_HOD_APPROVALS)).toBe(true);
    expect(svc.canAccessMenu(u, MenuKey.EMPLOYEE)).toBe(false);
  });

  it('TC-10 Manager without approval authority: Manager/HOD Approvals not visible', () => {
    const u = { roles: [RoleName.MANAGER], isApprovingAuthority: false };
    expect(svc.canAccessMenu(u, MenuKey.MANAGER_HOD_APPROVALS)).toBe(false);
  });

  it('TC-11 Finance Head without approval authority: finance visible, approvals not', () => {
    const u = { roles: [RoleName.FINANCE_HEAD], isApprovingAuthority: false };
    expect(svc.canAccessMenu(u, MenuKey.FINANCE_APPROVAL_SETTLEMENT)).toBe(true);
    expect(svc.canAccessMenu(u, MenuKey.MANAGER_HOD_APPROVALS)).toBe(false);
  });

  it('TC-16 Employee menu key never resolves true for any role', () => {
    for (const role of Object.values(RoleName)) {
      expect(svc.canAccessMenu({ roles: [role], isApprovingAuthority: true }, MenuKey.EMPLOYEE)).toBe(false);
    }
  });

  describe('Edge cases', () => {
    it('user has multiple roles: union of each role\u2019s access applies', () => {
      const u = { roles: [RoleName.EMPLOYEE, RoleName.FINANCE_HEAD], isApprovingAuthority: false };
      expect(svc.canAccessMenu(u, MenuKey.ACCOUNTING_SYNC)).toBe(true);
    });

    it('user has no role assigned: deny everything', () => {
      const u = { roles: [], isApprovingAuthority: false };
      expect(svc.canAccessMenu(u, MenuKey.MASTERS_POLICY)).toBe(false);
    });

    it('approval-authority flag missing/null: treated as false, not thrown', () => {
      const u = { roles: [RoleName.HOD], isApprovingAuthority: null as unknown as boolean };
      expect(svc.canAccessMenu(u, MenuKey.MANAGER_HOD_APPROVALS)).toBe(false);
    });

    it('approving authority with no Manager/HOD role still sees the menu', () => {
      const u = { roles: [RoleName.EMPLOYEE], isApprovingAuthority: true };
      expect(svc.canAccessMenu(u, MenuKey.MANAGER_HOD_APPROVALS)).toBe(true);
    });

    it('unknown menu key resolves to false', () => {
      const u = { roles: [RoleName.SUPER_ADMIN], isApprovingAuthority: true };
      expect(svc.canAccessMenu(u, 'NOT_A_REAL_MENU' as MenuKey)).toBe(false);
    });
  });
});
