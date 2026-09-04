import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RoleName } from '../../rbac/constants/roles.enum';

export interface JwtAccessPayload {
  sub: string; // user id
  email: string;
  roles: RoleName[];
  isApprovingAuthority: boolean;
  companyId: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET as string,
    });
  }

  // Whatever this returns becomes req.user — exactly the shape
  // MenuPermissionService.canAccessMenu() expects (roles, isApprovingAuthority),
  // plus id/email/companyId for the rest of the app.
  async validate(payload: JwtAccessPayload) {
    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles,
      isApprovingAuthority: payload.isApprovingAuthority,
      companyId: payload.companyId,
    };
  }
}
