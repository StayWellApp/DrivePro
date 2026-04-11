"use client";

import React from "react";
import { useTranslations } from "next-intl";

interface IntelligencePaneProps {
  isVisible: boolean;
  onClose: () => void;
  fault: {
    category: string;
    notes: string | null;
    riskScore: number | null;
  } | null;
}

export default function IntelligencePane({
  isVisible,
  onClose,
  fault,
}: IntelligencePaneProps) {
  const t = useTranslations("LessonDetail");
  if (!isVisible || !fault) return null;

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-red-500";
    if (score >= 50) return "text-amber-500";
    return "text-teal-500";
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-zinc-950/80 backdrop-blur-[30px] border-l border-white/10 z-[1000] shadow-2xl p-8 flex flex-col transform transition-transform duration-300">
      <button
        onClick={onClose}
        className="self-end text-zinc-500 hover:text-white mb-8"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div className="flex-1">
        <h3 className="text-zinc-500 uppercase tracking-widest text-xs font-bold mb-2">
          {t("analysis")}
        </h3>
        <h2 className="text-3xl font-black text-white mb-6 uppercase leading-tight">
          {fault.category}
        </h2>

        <div className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-zinc-400 text-sm mb-2 font-medium uppercase tracking-wider">
            {t("instructorNotes")}
          </p>
          <p className="text-white text-lg leading-relaxed">
            {fault.notes || "---"}
          </p>
        </div>

        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-1">
              {t("riskScore")}
            </p>
            <p className="text-zinc-500 text-xs italic">{t("aiEngine")}</p>
          </div>
          <div
            className={`text-5xl font-black ${getRiskColor(fault.riskScore || 0)}`}
          >
            {fault.riskScore ? `${Math.round(fault.riskScore)}%` : "N/A"}
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <button
          onClick={onClose}
          className="w-full py-4 bg-teal-500 text-zinc-950 font-black rounded-xl hover:bg-teal-400 transition"
        >
          {t("closeIntelligence")}
        </button>
      </div>
    </div>
  );
}
