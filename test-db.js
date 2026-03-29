const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const student = await prisma.student.findFirst({
    include: { payments: true }
  });
  console.log(student);
}
main().catch(console.error).finally(() => prisma.$disconnect());
