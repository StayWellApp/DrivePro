import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== "SUPER_ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { question, language, countryId, options, answer } = await req.json();

  const newQuestion = await prisma.theoryQuestion.create({
    data: {
      question,
      language,
      country_id: countryId,
      options,
      answer,
    },
  });

  return NextResponse.json(newQuestion);
}
