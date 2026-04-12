"use client";

import React from 'react';

interface SupportButtonProps {
  lessonId: string;
  metadata?: any;
}

export default function SupportButton({ lessonId, metadata }: SupportButtonProps) {
  const handleReport = () => {
    console.log('Reporting issue for lesson:', lessonId, 'with metadata:', metadata);
    alert('Support request sent! Our team will review the telemetry and video for lesson ' + lessonId);
  };

  return (
    <button
      onClick={handleReport}
      className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors"
    >
      <span className="material-symbols-outlined text-sm">report</span>
      Report Issue
    </button>
  );
}
