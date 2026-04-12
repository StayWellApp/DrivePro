"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function StopImpersonatingButton() {
  const { update } = useSession();
  const router = useRouter();

  const handleStop = async () => {
    await update({
      stopImpersonating: true
    });
    router.push("/super/schools");
    router.refresh();
  };

  return (
    <button
      onClick={handleStop}
      className="text-xs font-bold text-white hover:text-teal-400 transition-colors"
    >
      Stop Impersonating
    </button>
  );
}
