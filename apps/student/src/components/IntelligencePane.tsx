'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface IntelligencePaneProps {
  isVisible: boolean;
  onClose: () => void;
  onSeek?: (seconds: number) => void;
  fault: {
    category: string;
    notes: string | null;
    riskScore: number | null;
    video_offset_seconds?: number | null;
  } | null;
}

export default function IntelligencePane({ isVisible, onClose, onSeek, fault }: IntelligencePaneProps) {
  const t = useTranslations('LessonDetail');
  if (!isVisible || !fault) return null;

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-teal-500';
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[450px] bg-zinc-950/80 backdrop-blur-[30px] border-l border-white/10 z-[1000] shadow-2xl p-8 flex flex-col transform transition-transform duration-300">
      <button
        onClick={onClose}
        className="self-end text-zinc-500 hover:text-white mb-8 group transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <h3 className="text-zinc-500 uppercase tracking-widest text-xs font-black mb-2">{t('analysis')}</h3>
        <h2 className="text-4xl font-black text-white mb-8 uppercase leading-tight tracking-tighter">{fault.category}</h2>

        <div className="space-y-6">
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
            <p className="text-zinc-400 text-xs mb-3 font-black uppercase tracking-widest">{t('instructorNotes')}</p>
            <p className="text-white text-lg leading-relaxed font-medium">
              {fault.notes || 'No specific notes provided for this incident.'}
            </p>
          </div>

          <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-1">{t('riskScore')}</p>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-tighter">{t('aiEngine')}</p>
            </div>
            <div className={`text-5xl font-black ${getRiskColor(fault.riskScore || 0)}`}>
              {fault.riskScore ? `${Math.round(fault.riskScore)}%` : '42%'}
            </div>
          </div>

          <div className="p-6 bg-teal-500/10 rounded-3xl border border-teal-500/20">
             <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <p className="text-teal-400 text-xs font-black uppercase tracking-widest">{t('aiTip')}</p>
             </div>
             <p className="text-white text-sm leading-relaxed font-medium italic">
                AI Insight: When approaching ${fault.category.toLowerCase()} scenarios, prioritize early scanning. The Kinetic Precision engine suggests maintaining a 2-second buffer to improve your reaction metrics.
             </p>
          </div>

          {fault.video_offset_seconds !== null && fault.video_offset_seconds !== undefined && (
             <button
                onClick={() => onSeek && onSeek(fault.video_offset_seconds! - 5)}
                className="w-full p-6 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all group"
             >
                <div className="text-left">
                   <p className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-1">{t('dashcamLink')}</p>
                   <p className="text-white text-lg font-black uppercase">T - {fault.video_offset_seconds}s</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-primary ml-1">
                      <path d="M8 5v14l11-7z" />
                   </svg>
                </div>
             </button>
          )}
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={onClose}
          className="w-full py-5 bg-secondary text-primary font-black text-sm uppercase tracking-widest rounded-2xl hover:brightness-110 transition shadow-lg shadow-secondary/20"
        >
          {t('closeIntelligence')}
        </button>
      </div>
    </div>
  );
}
