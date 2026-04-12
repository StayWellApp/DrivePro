import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "SUPER_ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { countryId, data } = await req.json();
    if (!countryId || !data) {
      return new Response("Missing parameters", { status: 400 });
    }

    const lines = (data as string).split('\n').filter(l => l.trim() !== '');
    const questions = lines.map(line => {
      const parts = line.split(';');
      if (parts.length < 3) return null;

      const [question, optionsStr, answer] = parts;
      const options = optionsStr.split(',').map(o => o.trim());

      return {
        question: question.trim(),
        options: options,
        answer: answer.trim(),
        country_id: countryId,
        language: "cs" // Default to CZ for now as per task
      };
    }).filter(q => q !== null);

    await prisma.theoryQuestion.createMany({
      data: questions as any
    });

    return NextResponse.json({ success: true, count: questions.length });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
