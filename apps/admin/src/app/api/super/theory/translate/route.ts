import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "SUPER_ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { questionId } = await req.json();
    if (!questionId) {
      return new Response("Missing questionId", { status: 400 });
    }

    const sourceQuestion = await prisma.theoryQuestion.findUnique({
      where: { id: questionId }
    });

    if (!sourceQuestion) {
      return new Response("Question not found", { status: 404 });
    }

    // Placeholder: In a real app, this would call an AI translation service
    const translatedQuestion = await prisma.theoryQuestion.create({
      data: {
        question: `[EN] ${sourceQuestion.question}`,
        options: (sourceQuestion.options as string[]).map(opt => `[EN] ${opt}`),
        answer: `[EN] ${sourceQuestion.answer}`,
        language: "en",
        country_id: sourceQuestion.country_id
      }
    });

    return NextResponse.json({ success: true, question: translatedQuestion });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
