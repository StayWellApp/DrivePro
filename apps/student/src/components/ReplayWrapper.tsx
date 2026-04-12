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
  videoUrl?: string | null;
  labels: any;
}

export default function ReplayWrapper({ route, faults, videoUrl, labels }: ReplayWrapperProps) {
  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <LessonReplay
            route={route}
            faults={faults}
            videoUrl={videoUrl}
            labels={labels}
        />
      </div>
    </ErrorBoundary>
  );
}
