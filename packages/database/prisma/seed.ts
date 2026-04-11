import { PrismaClient, Role, CourseType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const instructorPassword = await bcrypt.hash("instructor123", 10);
  const studentPassword = await bcrypt.hash("student123", 10);

  // 1. Create Default School
  const school = await prisma.school.upsert({
    where: { id: "default-school" },
    update: {},
    create: {
      id: "default-school",
      name: "DrivePro Academy",
    },
  });

  console.log("Created school:", school.name);

  // 2. Create Global Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@drivepro.com" },
    update: {},
    create: {
      email: "admin@drivepro.com",
      password: adminPassword,
      role: Role.ADMIN,
      firstName: "Global",
      lastName: "Admin",
    },
  });

  console.log("Created admin user:", admin.email);

  // 3. Create a Demo Instructor
  const instructorUser = await prisma.user.upsert({
    where: { email: "instructor@example.com" },
    update: {},
    create: {
      email: "instructor@example.com",
      password: instructorPassword,
      role: Role.INSTRUCTOR,
      school_id: school.id,
      firstName: "Petr",
      lastName: "Marek",
      phoneNumber: "+420 777 000 111",
    },
  });

  const instructor = await prisma.instructor.upsert({
    where: { user_id: instructorUser.id },
    update: {},
    create: {
      user_id: instructorUser.id,
      school_id: school.id,
    },
  });

  console.log("Created instructor user and record:", instructorUser.email);

  // 4. Create a Demo Student User & Student Record
  const studentUser = await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: {
      email: "student@example.com",
      password: studentPassword,
      role: Role.STUDENT,
      school_id: school.id,
      firstName: "Jan",
      lastName: "Novak",
      phoneNumber: "+420 600 500 400",
    },
  });

  const student = await prisma.student.upsert({
    where: { user_id: studentUser.id },
    update: {},
    create: {
      user_id: studentUser.id,
      school_id: school.id,
      instructor_id: instructor.id,
      courseType: CourseType.B,
      balance: 500,
    },
  });

  console.log("Created student user and record:", studentUser.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
