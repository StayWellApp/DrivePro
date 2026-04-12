"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ImpersonateButton({ schoolId }: { schoolId: string }) {
  const { data: session, update } = useSession();
  const router = useRouter();

  const handleImpersonate = async () => {
    // In NextAuth v5, update() updates the session JWT on the server and then on the client.
    await update({
      impersonatedSchoolId: schoolId
    });
    router.push("/");
    router.refresh();
  };

  const isActive = (session?.user as any)?.activeSchoolId === schoolId;

  return (
    <button
      onClick={handleImpersonate}
      className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${isActive ? 'bg-teal-500 text-slate-900 cursor-default' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
    >
      {isActive ? "Currently Managing" : "Enter School"}
    </button>
  );
}
