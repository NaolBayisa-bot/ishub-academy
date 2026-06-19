import { PrismaClient, CategoryName, Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed categories
  const categories = [
    {
      name: CategoryName.CYBERSECURITY,
      description: 'Network security, ethical hacking, cryptography, and security operations.',
    },
    {
      name: CategoryName.DEVELOPMENT,
      description: 'Software engineering, web development, mobile apps, and DevOps.',
    },
    {
      name: CategoryName.NETWORKING,
      description: 'Network administration, routing, switching, and cloud infrastructure.',
    },
    {
      name: CategoryName.CREATIVE_WORKS,
      description: 'Graphic design, video editing, UI/UX, and digital content creation.',
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { description: cat.description },
      create: cat,
    });
  }
  console.log('Categories seeded.');

  // Seed main admin
  const adminEmail = 'admin@ishub.academy';
  const adminPassword = 'Admin123!';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const devCategory = await prisma.category.findUnique({
      where: { name: CategoryName.DEVELOPMENT },
    });

    await prisma.user.create({
      data: {
        fullName: 'IS Hub Admin',
        email: adminEmail,
        passwordHash,
        role: Role.MAIN_ADMIN,
        status: UserStatus.ACTIVE,
        department: 'ICT Directorate',
        academicYear: 'N/A',
        preferredCategoryId: devCategory!.id,
        approvedCategoryId: devCategory!.id,
      },
    });
    console.log(`Main admin created: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log('Main admin already exists.');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
