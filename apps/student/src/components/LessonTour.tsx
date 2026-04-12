"use client";

import React from 'react';
import dynamic from 'next/dynamic';

const Joyride = dynamic<any>(() => import('react-joyride').then(mod => mod.Joyride), { ssr: false });

export default function LessonTour() {
  const steps: any[] = [
    {
      target: '.telemetry-scrubber',
      content: 'Use this scrubber to move through your lesson. Both the map and video will sync automatically.',
      placement: 'top',
    },
    {
      target: '.video-player-container',
      content: 'Watch your dashcam footage here. It highlights key moments based on telemetry data.',
      placement: 'bottom',
    },
    {
      target: '.intelligence-pane-trigger',
      content: 'Click on any fault pin on the map to see AI-powered insights and instructor notes here.',
      placement: 'left',
    },
  ];

  return (
    <Joyride
      steps={steps}
      continuous
      showProgress
      showSkipButton
      styles={{
        options: {
          primaryColor: '#2DD4BF',
        },
      }}
    />
  );
}
