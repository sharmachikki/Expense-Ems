import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MenuGuard } from '../rbac/guards/menu.guard';
import { RequireMenu } from '../rbac/decorators/require-menu.decorator';
import { MenuKey } from '../rbac/constants/roles.enum';
import { MenuPermissionService } from '../rbac/menu-permission.service';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard, MenuGuard)
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private menuPermissionService: MenuPermissionService,
  ) {}

  // No @RequireMenu — every authenticated user may read their own profile
  // and the menus they're allowed to see. The frontend calls this once on
  // login to build its nav; it never trusts a client-supplied role.
  @Get('me')
  async me(@Req() req: Request) {
    const user = req.user as any;
    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
      isApprovingAuthority: user.isApprovingAuthority,
      companyId: user.companyId,
      visibleMenus: this.menuPermissionService.getVisibleMenus(user),
    };
  }

  // "Administration > Users" in the menu structure — grouped with the rest
  // of Masters & Policy per the architecture doc's Administration section.
  @RequireMenu(MenuKey.MASTERS_POLICY)
  @Get()
  async list(@Req() req: Request) {
    const user = req.user as any;
    return this.usersService.listForCompany(user.companyId);
  }
}
