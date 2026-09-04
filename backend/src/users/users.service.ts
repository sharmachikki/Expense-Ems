import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });
  }

  async listForCompany(companyId: string | null) {
    return this.prisma.user.findMany({
      where: companyId ? { companyId } : {},
      include: { roles: { include: { role: true } } },
      orderBy: { fullName: 'asc' },
    });
  }
}
