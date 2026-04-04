'use client';

import dynamic from 'next/dynamic';
import React from 'react';

interface FaultPin {
  id: string;
  category: string;
  notes: string | null;
  lat: number;
  lng: number;
  video_offset_seconds: number | null;
  riskScore: number | null;
}

interface LessonMapProps {
  route: [number, number][]; // Array of [lat, lng]
  faults: FaultPin[];
  videoUrl?: string;
}

const DynamicLessonMap = dynamic(() => import('./LessonMap'), { ssr: false });

export default function LessonMapWrapper(props: LessonMapProps) {
  return <DynamicLessonMap {...props} />;
}
