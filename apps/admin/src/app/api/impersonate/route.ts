import { auth } from "../../../auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { schoolId, action } = await req.json();

  if (action === "enter") {
    // Here we would ideally update the session.
    // Since NextAuth v5 session is managed via JWT,
    // we return a response that the client can use to trigger a session update.
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
