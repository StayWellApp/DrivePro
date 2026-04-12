"use client";

import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface WatchClipModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  startTime: number; // Offset in seconds
  duration?: number; // Duration of clip, default 10s
}

export function WatchClipModal({ isOpen, onClose, videoUrl, startTime, duration = 10 }: WatchClipModalProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen || !videoRef.current) return;

    const videoElement = document.createElement('video-js');
    videoElement.classList.add('vjs-big-play-centered');
    videoRef.current.appendChild(videoElement);

    // @ts-ignore
    const vjs = videojs.default || videojs;
    const player = playerRef.current = vjs(videoElement, {
      autoplay: true,
      controls: true,
      responsive: true,
      fluid: true,
      sources: [{
        src: videoUrl,
        type: 'video/mp4'
      }]
    }, () => {
      player.currentTime(Math.max(0, startTime - 5));

      const checkLoop = () => {
        const time = player.currentTime();
        if (typeof time === 'number' && time >= startTime + 5) {
          player.currentTime(Math.max(0, startTime - 5));
        }
      };

      player.on('timeupdate', checkLoop);
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [isOpen, videoUrl, startTime]);

  if (!isOpen) return null;

  return (
    <div className="ui:fixed ui:inset-0 ui:z-[2000] ui:flex ui:items-center ui:justify-center ui:p-4 ui:bg-black/80 ui:backdrop-blur-sm">
      <div className="ui:bg-zinc-900 ui:rounded-3xl ui:border ui:border-white/10 ui:w-full ui:max-w-4xl ui:overflow-hidden ui:relative">
        <button
          onClick={onClose}
          className="ui:absolute ui:top-4 ui:right-4 ui:z-10 ui:w-10 ui:h-10 ui:bg-white/10 ui:hover:ui:bg-white/20 ui:rounded-full ui:flex ui:items-center ui:justify-center ui:text-white ui:transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="ui:p-8">
           <h3 className="ui:text-2xl ui:font-black ui:text-white ui:mb-6 ui:tracking-tighter uppercase">Incident Replay</h3>
           <div data-vjs-player>
             <div ref={videoRef} />
           </div>
           <p className="ui:mt-6 ui:text-zinc-500 ui:text-sm ui:font-medium ui:uppercase ui:tracking-widest ui:text-center">
             Looping 10s window around incident
           </p>
        </div>
      </div>
    </div>
  );
}
