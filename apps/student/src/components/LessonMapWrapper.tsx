'use client';

import dynamic from 'next/dynamic';
import React from 'react';

interface FaultPin {
  id: string;
  category: string;
  notes: string | null;
  lat: number;
  lng: number;
}

interface LessonMapProps {
  route: [number, number][]; // Array of [lat, lng]
  faults: FaultPin[];
}

const DynamicLessonMap = dynamic(() => import('./LessonMap'), { ssr: false });

export default function LessonMapWrapper(props: LessonMapProps) {
  return <DynamicLessonMap {...props} />;
}
