"use client";

import dynamic from 'next/dynamic';
import ErrorBoundary from "@/components/ErrorBoundary";

const LessonReplay = dynamic<any>(
  () => import('@repo/ui').then((mod) => mod.LessonReplay),
  { ssr: false }
);

interface ReplayWrapperProps {
  route: any[];
  faults: any[];
  labels: any;
}

export default function ReplayWrapper({ route, faults, labels }: ReplayWrapperProps) {
  return (
    <ErrorBoundary>
      <LessonReplay
          route={route}
          faults={faults}
          labels={labels}
      />
    </ErrorBoundary>
  );
}
