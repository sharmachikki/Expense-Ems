import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

// One demo account per row of the RBAC test-case table (TC-01..TC-11), so
// the frontend nav and backend guards can be sanity-checked against the
// exact spec without any manual data setup.
const DEMO_USERS: Array<{
  email: string;
  fullName: string;
  role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'FINANCE_HEAD' | 'MANAGER' | 'HOD' | 'EMPLOYEE';
  isApprovingAuthority: boolean;
}> = [
  { email: 'companyadmin@demo.local', fullName: 'Company Admin (TC-01)', role: 'COMPANY_ADMIN', isApprovingAuthority: false },
  { email: 'superadmin@demo.local', fullName: 'Super Admin (TC-02)', role: 'SUPER_ADMIN', isApprovingAuthority: false },
  { email: 'financehead@demo.local', fullName: 'Finance Head (TC-03)', role: 'FINANCE_HEAD', isApprovingAuthority: false },
  { email: 'employee@demo.local', fullName: 'Regular Employee (TC-04)', role: 'EMPLOYEE', isApprovingAuthority: false },
  { email: 'manager.approver@demo.local', fullName: 'Manager + Approving Authority (TC-05)', role: 'MANAGER', isApprovingAuthority: true },
  { email: 'hod.approver@demo.local', fullName: 'HOD + Approving Authority (TC-06)', role: 'HOD', isApprovingAuthority: true },
  { email: 'financehead.approver@demo.local', fullName: 'Finance Head + Approving Authority (TC-07)', role: 'FINANCE_HEAD', isApprovingAuthority: true },
  { email: 'companyadmin.approver@demo.local', fullName: 'Company Admin + Approving Authority (TC-08)', role: 'COMPANY_ADMIN', isApprovingAuthority: true },
  { email: 'employee.approver@demo.local', fullName: 'Employee + Approving Authority (TC-09)', role: 'EMPLOYEE', isApprovingAuthority: true },
  { email: 'manager.noauth@demo.local', fullName: 'Manager without Approval Authority (TC-10)', role: 'MANAGER', isApprovingAuthority: false },
  { email: 'financehead.noauth@demo.local', fullName: 'Finance Head without Approval Authority (TC-11)', role: 'FINANCE_HEAD', isApprovingAuthority: false },
];

const DEMO_PASSWORD = 'Demo@12345';

async function main() {
  const roles = await Promise.all(
    (['SUPER_ADMIN', 'COMPANY_ADMIN', 'FINANCE_HEAD', 'MANAGER', 'HOD', 'EMPLOYEE'] as const).map((name) =>
      prisma.role.upsert({ where: { name }, update: {}, create: { name } }),
    ),
  );
  const roleByName = Object.fromEntries(roles.map((r) => [r.name, r]));

  const passwordHash = await argon2.hash(DEMO_PASSWORD);

  for (const u of DEMO_USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { isApprovingAuthority: u.isApprovingAuthority },
      create: {
        email: u.email,
        fullName: u.fullName,
        passwordHash,
        isApprovingAuthority: u.isApprovingAuthority,
      },
    });
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: roleByName[u.role].id } },
      update: {},
      create: { userId: user.id, roleId: roleByName[u.role].id },
    });
  }

  console.log(`Seeded ${DEMO_USERS.length} demo users. Password for all: ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
