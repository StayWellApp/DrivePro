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
