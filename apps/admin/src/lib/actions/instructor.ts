"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@repo/database";
import { revalidatePath } from "next/cache";

export async function createInstructorAction(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phoneNumber = formData.get("phoneNumber") as string;
  const schoolId = "default-school";

  if (!firstName || !lastName || !email) {
    throw new Error("Missing required fields");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("A user with this email already exists");
  }

  const hashedPassword = await bcrypt.hash("instructor123", 10);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        role: Role.INSTRUCTOR,
        school_id: schoolId,
        firstName,
        lastName,
        phoneNumber,
      },
    });

    await tx.instructor.create({
      data: {
        user_id: user.id,
        school_id: schoolId,
      },
    });
  });

  revalidatePath("/[locale]/instructors", "page");
}

export async function getInstructorLeaderboard() {
  const instructors = await prisma.instructor.findMany({
    include: {
      user: true,
      lessons: {
        include: {
          sessions: {
            include: {
              faultPins: true
            }
          }
        }
      },
      students: {
        include: {
          examAttempts: true
        }
      }
    }
  });

  return instructors.map(instructor => {
    const totalLessons = instructor.lessons.length;
    const totalHours = totalLessons * 1.5; // Assuming 1.5h per lesson

    let totalSeriousFaults = 0;
    instructor.lessons.forEach(lesson => {
      lesson.sessions.forEach(session => {
        totalSeriousFaults += session.faultPins.filter(f => f.category.toLowerCase().includes('serious') || f.riskScore! > 70).length;
      });
    });

    const avgSeriousFaults = totalLessons > 0 ? totalSeriousFaults / totalLessons : 0;

    let totalStudents = instructor.students.length;
    let passedStudents = instructor.students.filter(s => s.examAttempts.some(attempt => attempt.passed)).length;
    const passRate = totalStudents > 0 ? (passedStudents / totalStudents) * 100 : 0;

    return {
      id: instructor.id,
      name: instructor.user.firstName + ' ' + instructor.user.lastName,
      passRate,
      avgSeriousFaults,
      totalHours,
      totalStudents
    };
  }).sort((a, b) => b.passRate - a.passRate);
}

export async function getInstructorById(id: string) {
  return prisma.instructor.findUnique({
    where: { id },
    include: { user: true, school: true }
  });
}
