import { Global, Module } from '@nestjs/common';
import { MenuPermissionService } from './menu-permission.service';
import { MenuGuard } from './guards/menu.guard';

@Global()
@Module({
  providers: [MenuPermissionService, MenuGuard],
  exports: [MenuPermissionService, MenuGuard],
})
export class RbacModule {}
