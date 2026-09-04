import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { PrismaService } from '../common/prisma.service';
import { RoleName } from '../rbac/constants/roles.enum';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days, matches JWT_REFRESH_EXPIRES_IN default

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string, meta: { ip?: string; userAgent?: string }): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });

    const success = !!user && user.isActive && (await argon2.verify(user.passwordHash, password).catch(() => false));

    // Log every attempt (success and failure) for login-attempt protection,
    // without leaking whether the account exists in the response.
    await this.prisma.loginAttempt.create({
      data: { userId: user?.id, email, success: !!success, ipAddress: meta.ip },
    });

    if (!user || !success) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.issueTokens(user.id, meta);
  }

  async refresh(rawRefreshToken: string, meta: { ip?: string; userAgent?: string }): Promise<Tokens> {
    let payload: { sub: string };
    try {
      payload = this.jwt.verify(rawRefreshToken, { secret: process.env.JWT_REFRESH_SECRET });
    } catch {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const tokenHash = this.hashToken(rawRefreshToken);
    const session = await this.prisma.session.findUnique({ where: { refreshTokenHash: tokenHash } });

    if (!session || session.revokedAt || session.expiresAt < new Date() || session.userId !== payload.sub) {
      // Reuse of a revoked/expired/unknown token: treat as compromise and
      // revoke all sessions for this user as a precaution.
      if (session) {
        await this.prisma.session.updateMany({
          where: { userId: session.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
      throw new ForbiddenException('Refresh token is no longer valid. Please log in again.');
    }

    // Rotate: revoke the used token, issue a fresh pair.
    await this.prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
    return this.issueTokens(session.userId, meta);
  }

  async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawRefreshToken);
    await this.prisma.session.updateMany({
      where: { refreshTokenHash: tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issueTokens(userId: string, meta: { ip?: string; userAgent?: string }): Promise<Tokens> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { roles: { include: { role: true } } },
    });

    const roles = user.roles.map((ur) => ur.role.name as unknown as RoleName);

    const accessToken = this.jwt.sign(
      {
        sub: user.id,
        email: user.email,
        roles,
        isApprovingAuthority: user.isApprovingAuthority,
        companyId: user.companyId,
      },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m' },
    );

    const refreshToken = this.jwt.sign(
      { sub: user.id },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d' },
    );

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: this.hashToken(refreshToken),
        userAgent: meta.userAgent,
        ipAddress: meta.ip,
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      },
    });

    return { accessToken, refreshToken };
  }

  // Refresh tokens are stored hashed (never in plaintext) so a DB read
  // alone can't be replayed as a valid session.
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
