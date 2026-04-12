import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if ((session?.user as any)?.role !== "SUPER_ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const schools = await prisma.school.findMany({
    include: { country: true },
    orderBy: { name: 'asc' }
  });

  return NextResponse.json(schools);
}
