"use client";

import { useState } from 'react';
import { useTranslations } from "next-intl";

export default function SponsorLinkManager({ studentId }: { studentId: string }) {
  const t = useTranslations("Dashboard");
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateLink = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/students/${studentId}/sponsor-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: '1234' })
      });
      const data = await res.json();
      const url = `${window.location.origin}/cs/shared/${data.token}?passcode=1234`;
      setLink(url);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
      <div>
        <h4 className="font-bold text-slate-900">{t("sponsorView")}</h4>
        <p className="text-xs text-slate-500">{t("shareProgress")}</p>
      </div>
      {link ? (
        <div className="flex gap-2">
           <input
              readOnly
              value={link}
              className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-[10px] font-mono w-64"
           />
           <button
              onClick={() => navigator.clipboard.writeText(link)}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-xs"
           >
              Copy
           </button>
        </div>
      ) : (
        <button
          onClick={generateLink}
          disabled={loading}
          className="bg-teal-500 text-slate-900 px-6 py-3 rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform disabled:opacity-50"
        >
          {loading ? 'Generating...' : t("shareProgress")}
        </button>
      )}
    </div>
  );
}
