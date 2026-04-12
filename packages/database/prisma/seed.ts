import { PrismaClient, Role, CourseType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const superAdminPassword = await bcrypt.hash("owner123", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);
  const instructorPassword = await bcrypt.hash("instructor123", 10);
  const studentPassword = await bcrypt.hash("student123", 10);

  // 1. Create Countries
  const czechia = await (prisma as any).country.upsert({
    where: { isoCode: "CZ" },
    update: {},
    create: {
      name: "Czechia",
      isoCode: "CZ",
      currency: "CZK",
      languageCode: "cs",
    },
  });

  const slovakia = await (prisma as any).country.upsert({
    where: { isoCode: "SK" },
    update: {},
    create: {
      name: "Slovakia",
      isoCode: "SK",
      currency: "EUR",
      languageCode: "sk",
    },
  });

  console.log("Created countries: CZ, SK");

  // 2. Create SUPER_ADMIN
  const superAdmin = await prisma.user.upsert({
    where: { email: "owner@drivepro.com" },
    update: {},
    create: {
      email: "owner@drivepro.com",
      password: superAdminPassword,
      role: Role.SUPER_ADMIN,
      firstName: "Platform",
      lastName: "Owner",
    },
  });

  console.log("Created super admin user:", superAdmin.email);

  // 3. Create Default School
  const school = await prisma.school.upsert({
    where: { id: "default-school" },
    update: {
      country_id: czechia.id,
    },
    create: {
      id: "default-school",
      name: "DrivePro Academy",
      country_id: czechia.id,
    },
  });

  console.log("Created school:", school.name);

  // 4. Create Global Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@drivepro.com" },
    update: {},
    create: {
      email: "admin@drivepro.com",
      password: adminPassword,
      role: Role.ADMIN,
      school_id: school.id,
      firstName: "Global",
      lastName: "Admin",
    },
  });

  console.log("Created admin user:", admin.email);

  // 5. Create a Demo Instructor
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

  // 6. Create a Demo Student User & Student Record
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

  // 7. Theory Questions (Czech & English)
  const theoryQuestions = [
    {
      id: "q1",
      question: "Jaká je maximální povolená rychlost v obci, není-li dopravní značkou stanoveno jinak?",
      language: "cs",
      options: ["30 km/h", "50 km/h", "70 km/h", "90 km/h"],
      answer: "50 km/h",
      country_id: czechia.id
    },
    {
      id: "q1-en",
      question: "What is the maximum speed limit in a built-up area unless otherwise indicated by a traffic sign?",
      language: "en",
      options: ["30 km/h", "50 km/h", "70 km/h", "90 km/h"],
      answer: "50 km/h",
      country_id: czechia.id
    },
    {
      id: "q2",
      question: "Kdy musí řidič dát znamení o změně směru jízdy?",
      language: "cs",
      options: ["Pouze v noci", "Před zahájením jízdního úkonu", "Až během odbočování", "Není to nutné"],
      answer: "Před zahájením jízdního úkonu",
      country_id: czechia.id
    },
    {
      id: "q2-en",
      question: "When must a driver give a signal of a change in direction of travel?",
      language: "en",
      options: ["Only at night", "Before starting the driving maneuver", "Only during turning", "It is not necessary"],
      answer: "Before starting the driving maneuver",
      country_id: czechia.id
    }
  ];

  for (const q of theoryQuestions) {
    await (prisma as any).theoryQuestion.upsert({
      where: { id: q.id },
      update: {
        question: q.question,
        language: q.language,
        options: q.options,
        answer: q.answer,
        country_id: q.country_id
      },
      create: {
        id: q.id,
        question: q.question,
        language: q.language,
        options: q.options,
        answer: q.answer,
        country_id: q.country_id
      }
    });
  }
  console.log("Seeded theory questions");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
