"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TheoryTableActions({ questionId }: { questionId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleTranslate() {
    setLoading(true);
    try {
      const res = await fetch("/api/super/theory/translate", {
        method: "POST",
        body: JSON.stringify({ questionId }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={handleTranslate}
        disabled={loading}
        className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all disabled:opacity-50"
        title="Generate English Version"
      >
        <span className="material-symbols-outlined text-sm">{loading ? "sync" : "translate"}</span>
      </button>
      <button className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all">
        <span className="material-symbols-outlined text-sm">edit</span>
      </button>
    </div>
  );
}
