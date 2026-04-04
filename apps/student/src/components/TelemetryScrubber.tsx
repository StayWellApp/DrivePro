'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface TelemetryScrubberProps {
  currentTime: number;
  duration: number;
  onChange: (time: number) => void;
}

export default function TelemetryScrubber({ currentTime, duration, onChange }: TelemetryScrubberProps) {
  const t = useTranslations('LessonsList'); // Reusing for generic strings if needed or LessonDetail
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-4">
      <span className="text-white font-mono text-sm w-12 text-right">
        {formatTime(currentTime)}
      </span>

      <div className="flex-1 relative h-6 flex items-center">
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
        />
      </div>

      <span className="text-zinc-400 font-mono text-sm w-12">
        {formatTime(duration)}
      </span>
    </div>
  );
}
