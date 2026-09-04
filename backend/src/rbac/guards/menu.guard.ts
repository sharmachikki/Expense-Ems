import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MenuPermissionService } from '../menu-permission.service';
import { MENU_KEY } from '../decorators/require-menu.decorator';
import { MenuKey } from '../constants/roles.enum';

/**
 * Runs after JwtAuthGuard (which attaches req.user). If a route has no
 * @RequireMenu() decorator, it is left alone — this guard only enforces
 * menu-scoped routes, it is not a blanket auth gate.
 *
 * A missing or unauthenticated req.user under a protected route is treated
 * as denied rather than throwing an unrelated error, so a guard ordering
 * mistake fails closed (403) instead of failing open.
 */
@Injectable()
export class MenuGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private menuPermissionService: MenuPermissionService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const menu = this.reflector.getAllAndOverride<MenuKey | undefined>(MENU_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!menu) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Not authorized for this resource.');
    }

    const allowed = this.menuPermissionService.canAccessMenu(user, menu);
    if (!allowed) {
      throw new ForbiddenException('Not authorized for this resource.');
    }
    return true;
  }
}
