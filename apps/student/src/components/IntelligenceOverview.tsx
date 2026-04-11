"use client";

import { useEffect, useState } from 'react';
import { Gauge } from '@repo/ui';

interface IntelligenceData {
  readiness: {
    score: number;
    breakdown: {
      theory: number;
      safety: number;
      experience: number;
    };
  };
  hotspots: Array<{
    weakness: string;
    insight: string;
    count: number;
  }>;
}

export default function IntelligenceOverview({ studentId }: { studentId: string }) {
  const [data, setData] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/students/${studentId}/intelligence`)
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <div className="h-64 animate-pulse bg-white/5 rounded-2xl" />;
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-[#0F172A] p-8 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
        <Gauge
          value={data.readiness.score}
          label="Exam Readiness"
          sublabel="AI Prediction for Prague Pilot"
        />
        <div className="grid grid-cols-3 gap-4 mt-8 w-full">
           <div className="text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Theory</p>
              <p className="text-white font-black">{data.readiness.breakdown.theory}%</p>
           </div>
           <div className="text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Safety</p>
              <p className="text-white font-black">{data.readiness.breakdown.safety}%</p>
           </div>
           <div className="text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Hours</p>
              <p className="text-white font-black">{data.readiness.breakdown.experience}%</p>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Hotspot Intelligence</h4>
        {data.hotspots.length === 0 ? (
          <p className="text-slate-500 italic">No hotspots identified yet. Keep driving!</p>
        ) : (
          data.hotspots.map((h, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-error-container/10 text-error flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div>
                <p className="font-bold text-slate-900">{h.weakness}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{h.insight}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
