"use client";

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
  url: string;
  onTimeUpdate: (time: number) => void;
  onReady?: (player: any) => void;
}

export const VideoPlayer = forwardRef(({ url, onTimeUpdate, onReady }: VideoPlayerProps, ref) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    seekTo: (time: number) => {
      if (playerRef.current && Math.abs(playerRef.current.currentTime() - time) > 0.5) {
        playerRef.current.currentTime(time);
      }
    },
    pause: () => playerRef.current?.pause(),
    play: () => playerRef.current?.play(),
  }));

  useEffect(() => {
    if (!videoRef.current) return;

    const videoElement = document.createElement('video-js');
    videoElement.classList.add('vjs-big-play-centered', 'vjs-theme-city');
    videoRef.current.appendChild(videoElement);

    // @ts-ignore
    const vjs = videojs.default || videojs;
    const player = playerRef.current = vjs(videoElement, {
      autoplay: false,
      controls: true,
      responsive: true,
      fluid: true,
      preload: 'auto',
      sources: [{
        src: url,
        type: 'video/mp4'
      }]
    }, () => {
      onReady?.(player);
    });

    player.on('timeupdate', () => {
      const time = player.currentTime();
      if (typeof time === 'number') {
        onTimeUpdate(time);
      }
    });

    return () => {
      if (player) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [url]);

  return (
    <div className="ui:rounded-2xl ui:overflow-hidden ui:border ui:border-white/10 ui:shadow-2xl ui:bg-zinc-950">
      <div data-vjs-player>
        <div ref={videoRef} />
      </div>
    </div>
  );
});
