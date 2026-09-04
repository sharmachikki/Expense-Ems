import { SetMetadata } from '@nestjs/common';
import { MenuKey } from '../constants/roles.enum';

export const MENU_KEY = 'require_menu';

/**
 * Tags a controller or route handler with the MenuKey it belongs to.
 * MenuGuard reads this metadata and calls MenuPermissionService — the same
 * function the frontend uses to decide what to render — so a user who
 * can't see a menu also can't call its API, no matter how they reach it
 * (direct URL, curl, modified frontend state). See AC-07 / AC-08.
 */
export const RequireMenu = (menu: MenuKey) => SetMetadata(MENU_KEY, menu);
