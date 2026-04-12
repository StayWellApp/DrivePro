import { PrismaClient, Role, CourseType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const superAdminPassword = await bcrypt.hash("owner123", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);
  const instructorPassword = await bcrypt.hash("instructor123", 10);
  const studentPassword = await bcrypt.hash("student123", 10);

  // 1. Create Countries
  const czechia = await prisma.country.upsert({
    where: { isoCode: "CZ" },
    update: {},
    create: {
      name: "Czechia",
      isoCode: "CZ",
      currency: "CZK",
      languageCode: "cs",
    },
  });

  const slovakia = await prisma.country.upsert({
    where: { isoCode: "SK" },
    update: {},
    create: {
      name: "Slovakia",
      isoCode: "SK",
      currency: "EUR",
      languageCode: "sk",
    },
  });

  const poland = await prisma.country.upsert({
    where: { isoCode: "PL" },
    update: {},
    create: {
      name: "Poland",
      isoCode: "PL",
      currency: "PLN",
      languageCode: "pl",
    },
  });

  console.log("Created countries: CZ, SK, PL");

  // 2. Create SUPER_ADMIN (God Mode)
  const superAdmin = await prisma.user.upsert({
    where: { email: "owner@drivepro.com" },
    update: {
      password: superAdminPassword,
      role: Role.SUPER_ADMIN,
    },
    create: {
      email: "owner@drivepro.com",
      password: superAdminPassword,
      role: Role.SUPER_ADMIN,
      firstName: "Platform",
      lastName: "Owner",
    },
  });

  console.log("Created super admin user:", superAdmin.email);

  // 3. Create CZ School & Users
  const czSchool = await prisma.school.upsert({
    where: { id: "cz-school" },
    update: { country_id: czechia.id },
    create: {
      id: "cz-school",
      name: "DrivePro Prague",
      country_id: czechia.id,
    },
  });

  const czAdmin = await prisma.user.upsert({
    where: { email: "admin.cz@drivepro.com" },
    update: { school_id: czSchool.id },
    create: {
      email: "admin.cz@drivepro.com",
      password: adminPassword,
      role: Role.ADMIN,
      school_id: czSchool.id,
      firstName: "Czech",
      lastName: "Admin",
    },
  });

  const czStudentUser = await prisma.user.upsert({
    where: { email: "student.cz@drivepro.com" },
    update: { school_id: czSchool.id },
    create: {
      email: "student.cz@drivepro.com",
      password: studentPassword,
      role: Role.STUDENT,
      school_id: czSchool.id,
      firstName: "Jan",
      lastName: "Novak",
    },
  });

  await prisma.student.upsert({
    where: { user_id: czStudentUser.id },
    update: { school_id: czSchool.id },
    create: {
      user_id: czStudentUser.id,
      school_id: czSchool.id,
      courseType: CourseType.B,
      balance: 1000,
    },
  });

  // 4. Create SK School & Users
  const skSchool = await prisma.school.upsert({
    where: { id: "sk-school" },
    update: { country_id: slovakia.id },
    create: {
      id: "sk-school",
      name: "DrivePro Bratislava",
      country_id: slovakia.id,
    },
  });

  const skAdmin = await prisma.user.upsert({
    where: { email: "admin.sk@drivepro.com" },
    update: { school_id: skSchool.id },
    create: {
      email: "admin.sk@drivepro.com",
      password: adminPassword,
      role: Role.ADMIN,
      school_id: skSchool.id,
      firstName: "Slovak",
      lastName: "Admin",
    },
  });

  const skStudentUser = await prisma.user.upsert({
    where: { email: "student.sk@drivepro.com" },
    update: { school_id: skSchool.id },
    create: {
      email: "student.sk@drivepro.com",
      password: studentPassword,
      role: Role.STUDENT,
      school_id: skSchool.id,
      firstName: "Igor",
      lastName: "Horvath",
    },
  });

  await prisma.student.upsert({
    where: { user_id: skStudentUser.id },
    update: { school_id: skSchool.id },
    create: {
      user_id: skStudentUser.id,
      school_id: skSchool.id,
      courseType: CourseType.B,
      balance: 50,
    },
  });

  console.log("Seeded CZ and SK schools and students");

  // 5. Theory Questions (Native + Translations)
  const theoryQuestions = [
    {
      id: "cz-q1",
      question: "Jaká je maximální povolená rychlost v obci?",
      language: "cs",
      options: ["30 km/h", "50 km/h", "70 km/h"],
      answer: "50 km/h",
      country_id: czechia.id
    },
    {
      id: "sk-q1",
      question: "Aká je maximálna povolená rýchlosť v obci?",
      language: "sk",
      options: ["30 km/h", "50 km/h", "70 km/h"],
      answer: "50 km/h",
      country_id: slovakia.id
    }
  ];

  for (const q of theoryQuestions) {
    await prisma.theoryQuestion.upsert({
      where: { id: q.id },
      update: q,
      create: q,
    });
  }

  console.log("Seeded multi-country theory questions");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
