import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { schoolId, action } = await req.json();

  if (action === "enter") {
    return NextResponse.json({
      success: true,
      impersonatedSchoolId: schoolId
    });
  } else if (action === "exit") {
    return NextResponse.json({
      success: true,
      stopImpersonating: true
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
