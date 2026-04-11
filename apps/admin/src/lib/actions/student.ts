"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role, CourseType } from "@repo/database";
import { revalidatePath } from "next/cache";

export async function createStudentAction(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phoneNumber = formData.get("phoneNumber") as string;
  const courseType = formData.get("courseType") as CourseType;
  const instructorId = formData.get("instructorId") as string;
  const schoolId = "default-school";

  if (!firstName || !lastName || !email || !courseType) {
    throw new Error("Missing required fields: firstName, lastName, email, courseType");
  }

  const phoneRegex = /^(\+420|\+421)\s?[0-9]{3}\s?[0-9]{3}\s?[0-9]{3}$/;
  if (phoneNumber && !phoneRegex.test(phoneNumber)) {
    throw new Error("Invalid phone number format. Use +420 123 456 789 or +421 123 456 789");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("A user with this email already exists");
  }

  const hashedPassword = await bcrypt.hash("student123", 10);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        role: Role.STUDENT,
        school_id: schoolId,
        firstName,
        lastName,
        phoneNumber,
      },
    });

    await tx.student.create({
      data: {
        user_id: user.id,
        school_id: schoolId,
        instructor_id: instructorId || null,
        courseType,
      },
    });
  });

  revalidatePath("/[locale]/students", "page");
}

export async function updateStudentInstructorAction(studentId: string, instructorId: string) {
  await prisma.student.update({
    where: { id: studentId },
    data: { instructor_id: instructorId || null },
  });
  revalidatePath("/[locale]/students", "page");
}
