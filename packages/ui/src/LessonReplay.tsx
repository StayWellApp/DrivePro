"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { TelemetryScrubber } from "./TelemetryScrubber.js";
import { IntelligencePane } from "./IntelligencePane.js";
import { VideoPlayer } from "./VideoPlayer.js";
import { WatchClipModal } from "./WatchClipModal.js";

function MapBounds({ route }: { route: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (route.length > 0) {
      map.fitBounds(route);
    }
  }, [map, route]);
  return null;
}

function HeatmapLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();
  useEffect(() => {
    // @ts-ignore
    const heat = L.heatLayer(points, {
      radius: 20,
      blur: 20,
      maxZoom: 17,
      gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
    }).addTo(map);
    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);
  return null;
}

export interface FaultPin {
  id: string;
  category: string;
  severity: "minor" | "serious" | "dangerous";
  notes: string | null;
  lat: number;
  lng: number;
  timestamp: string;
  riskScore?: number | null;
  video_offset_seconds?: number | null;
}

export interface ReplayPoint {
  lat: number;
  lng: number;
  timestamp: string;
}

export enum VideoState {
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  UNAVAILABLE = 'UNAVAILABLE'
}

interface LessonReplayProps {
  route: ReplayPoint[];
  faults: FaultPin[];
  videoUrl?: string | null;
  videoState?: VideoState;
  labels?: {
    start: string;
    end: string;
    replayAnalysis: string;
    replayIncident: string;
    videoProcessing: string;
  };
}

export function LessonReplay({
  route,
  faults,
  videoUrl,
  videoState = VideoState.READY,
  labels = {
    start: "START",
    end: "END",
    replayAnalysis: "REPLAY ANALYSIS",
    replayIncident: "VIEW INCIDENT",
    videoProcessing: "Video is being optimized, check back in 10 minutes"
  }
}: LessonReplayProps) {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeFault, setActiveFault] = useState<FaultPin | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isClipModalOpen, setIsClipModalOpen] = useState(false);
  const videoRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  const routePositions = useMemo(() => route.map(p => [p.lat, p.lng] as [number, number]), [route]);

  const heatmapPoints = useMemo(() =>
    faults.map(f => [f.lat, f.lng, f.severity === 'dangerous' ? 1.0 : f.severity === 'serious' ? 0.6 : 0.3] as [number, number, number]),
  [faults]);

  const duration = useMemo(() => {
    if (route.length < 2) return 0;
    const p1 = route[0];
    const p2 = route[route.length - 1];
    if (!p1 || !p2) return 0;
    const start = new Date(p1.timestamp).getTime();
    const end = new Date(p2.timestamp).getTime();
    return (end - start) / 1000;
  }, [route]);

  const carPosition = useMemo(() => {
    if (routePositions.length === 0) return null;
    if (duration === 0) return routePositions[0] || null;

    const progress = currentTime / duration;
    const index = Math.floor(progress * (routePositions.length - 1));
    const nextIndex = Math.min(index + 1, routePositions.length - 1);
    const p1 = routePositions[index];
    const p2 = routePositions[nextIndex];
    if (!p1 || !p2) return p1 || p2 || null;
    if (index === nextIndex) return p1;
    const segmentProgress = progress * (routePositions.length - 1) - index;
    return [
      p1[0] + (p2[0] - p1[0]) * segmentProgress,
      p1[1] + (p2[1] - p1[1]) * segmentProgress,
    ] as [number, number];
  }, [routePositions, currentTime, duration]);

  const currentSpeed = useMemo(() => {
    if (route.length < 2 || duration === 0) return 0;
    const progress = currentTime / duration;
    const index = Math.max(0, Math.floor(progress * (route.length - 1)) - 1);
    const nextIndex = index + 1;
    const p1 = route[index];
    const p2 = route[nextIndex];
    if (!p1 || !p2) return 0;
    const dist = L.latLng(p1.lat, p1.lng).distanceTo(L.latLng(p2.lat, p2.lng)) / 1000;
    const time = (new Date(p2.timestamp).getTime() - new Date(p1.timestamp).getTime()) / (1000 * 3600);
    return time > 0 ? Math.round(dist / time) : 0;
  }, [route, currentTime, duration]);

  const handleScrubberChange = (time: number) => {
    setCurrentTime(time);
    videoRef.current?.seekTo(time);
  };

  const handleVideoTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  if (!mounted) return <div className="ui:h-[600px] ui:w-full ui:bg-zinc-950 ui:animate-pulse ui:rounded-3xl" />;

  const center = routePositions.length > 0 && routePositions[0] ? routePositions[0] : [49.8175, 15.473] as [number, number];

  const getFaultColor = (severity: string) => {
    switch(severity) {
      case "dangerous": return "ui:bg-error ui:ring-error/30";
      case "serious": return "ui:bg-amber-500 ui:ring-amber-500/30";
      default: return "ui:bg-secondary-fixed ui:ring-secondary-fixed/30";
    }
  };

  const showVideoPlayer = videoState === VideoState.READY && videoUrl;
  const showProcessingPlaceholder = videoState === VideoState.PROCESSING;

  return (
    <div className="ui:relative ui:space-y-6 ui:group">
      <div className={`ui:grid ui:grid-cols-1 ${showVideoPlayer || showProcessingPlaceholder ? 'lg:ui:grid-cols-2' : ''} ui:gap-6`}>
        <div className="ui:h-[500px] ui:w-full ui:rounded-3xl ui:overflow-hidden ui:border ui:border-white/10 ui:shadow-2xl ui:relative ui:z-0">
          <MapContainer center={center} zoom={13} className="ui:h-full ui:w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {routePositions.length > 0 && (
              <>
                <Polyline positions={routePositions as any} color="#2DD4BF" weight={6} opacity={0.6} />
                <MapBounds route={routePositions as any} />
              </>
            )}

            {showHeatmap && <HeatmapLayer points={heatmapPoints} />}

            {!showHeatmap && faults.map((fault) => (
              <Marker
                key={fault.id}
                position={[fault.lat, fault.lng]}
                eventHandlers={{ click: () => setActiveFault(fault) }}
                icon={L.divIcon({
                  className: "custom-fault-icon",
                  html: `<div class="ui:w-10 ui:h-10 ${getFaultColor(fault.severity)} ui:rounded-full ui:flex ui:items-center ui:justify-center ui:shadow-2xl ui:ring-4 ui:hover:scale-110 ui:transition-transform ui:cursor-pointer ui:border-2 ui:border-white/20">
                          <span class="ui:text-white ui:font-bold ui:text-xs">${fault.category[0]}</span>
                        </div>`,
                  iconSize: [40, 40],
                  iconAnchor: [20, 20],
                })}
              >
                <Popup className="custom-popup">
                  <div className="ui:p-2">
                    <strong className="ui:block ui:text-zinc-950 ui:mb-1">{fault.category}</strong>
                    <p className="ui:text-zinc-600 ui:text-xs ui:mb-3 ui:font-medium ui:uppercase ui:tracking-tighter">{fault.severity} fault</p>
                    <button
                      onClick={() => setActiveFault(fault)}
                      className="ui:w-full ui:py-2 ui:bg-zinc-900 ui:text-white ui:rounded-lg ui:font-bold ui:text-xs hover:ui:bg-zinc-800 ui:transition intelligence-pane-trigger"
                    >
                      {labels.replayAnalysis}
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {carPosition && (
              <Marker
                position={carPosition as any}
                icon={L.divIcon({
                  className: "custom-car-icon",
                  html: `<div class="ui:w-8 ui:h-8 ui:bg-white ui:rounded-full ui:flex ui:items-center ui:justify-center ui:shadow-2xl ui:ring-4 ui:ring-teal-500/30">
                          <div class="ui:w-3 ui:h-3 ui:bg-zinc-950 ui:rounded-full ui:animate-ping"></div>
                        </div>`,
                  iconSize: [32, 32],
                  iconAnchor: [16, 16],
                })}
              />
            )}
          </MapContainer>
        </div>

        {(showVideoPlayer || showProcessingPlaceholder) && (
          <div className="ui:h-[500px] video-player-container">
            {showVideoPlayer ? (
              <VideoPlayer
                ref={videoRef}
                url={videoUrl!}
                onTimeUpdate={handleVideoTimeUpdate}
              />
            ) : (
              <div className="ui:h-full ui:w-full ui:bg-zinc-900 ui:rounded-3xl ui:flex ui:flex-col ui:items-center ui:justify-center ui:border ui:border-white/5 ui:text-zinc-500 ui:p-8 ui:text-center">
                 <span className="material-symbols-outlined ui:text-6xl ui:mb-4 ui:animate-spin">sync</span>
                 <p className="ui:font-black ui:uppercase ui:tracking-widest ui:text-xs">{labels.videoProcessing}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="ui:flex ui:items-center ui:justify-between ui:bg-zinc-950/50 ui:p-4 ui:rounded-2xl ui:border ui:border-white/5 ui:backdrop-blur-xl">
        <div className="ui:flex ui:gap-4">
          <div className="ui:flex ui:items-center ui:gap-3 ui:px-4 ui:py-2 ui:bg-zinc-900 ui:rounded-xl ui:border ui:border-white/10">
             <span className="material-symbols-outlined ui:text-teal-400">speed</span>
             <div>
                <p className="ui:text-[8px] ui:font-black ui:text-zinc-500 ui:uppercase ui:tracking-widest">Speed</p>
                <p className="ui:text-lg ui:font-black ui:text-white">{currentSpeed} <span className="ui:text-[10px] ui:text-zinc-500">km/h</span></p>
             </div>
          </div>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`ui:px-6 ui:py-2 ui:rounded-xl ui:font-black ui:text-[10px] ui:uppercase ui:tracking-widest ui:transition-all ui:flex ui:items-center ui:gap-2 ui:border ${showHeatmap ? 'ui:bg-teal-500 ui:text-slate-900 ui:border-teal-400' : 'ui:bg-zinc-900 ui:text-white ui:border-white/10'}`}
          >
            <span className="material-symbols-outlined ui:text-lg">local_fire_department</span>
            Heatmap
          </button>
        </div>

        <div className="ui:w-full ui:max-w-xl ui:px-8 telemetry-scrubber">
          <TelemetryScrubber
            currentTime={currentTime}
            duration={duration}
            onChange={handleScrubberChange}
          />
        </div>
      </div>

      <IntelligencePane
        isOpen={!!activeFault}
        onClose={() => setActiveFault(null)}
        title={activeFault?.category || "Analysis"}
      >
        <div className="ui:space-y-6">
           <div className="ui:p-6 ui:bg-white/5 ui:rounded-2xl ui:border ui:border-white/10">
              <p className="ui:text-zinc-400 ui:text-sm ui:mb-2 ui:font-medium ui:uppercase ui:tracking-wider">Instructor Notes</p>
              <p className="ui:text-white ui:text-lg ui:leading-relaxed">{activeFault?.notes || "---"}</p>
           </div>

           {activeFault?.video_offset_seconds !== undefined && showVideoPlayer && (
             <button
               onClick={() => setIsClipModalOpen(true)}
               className="ui:w-full ui:py-4 ui:bg-teal-500 ui:text-slate-950 ui:rounded-2xl ui:font-black ui:uppercase ui:tracking-widest ui:flex ui:items-center ui:justify-center ui:gap-2 hover:ui:bg-teal-400 ui:transition-colors"
             >
               <span className="material-symbols-outlined">play_circle</span>
               Watch Incident Clip
             </button>
           )}

           <div className="ui:p-6 ui:bg-white/5 ui:rounded-2xl ui:border ui:border-white/10 ui:flex ui:items-center ui:justify-between">
              <div>
                <p className="ui:text-zinc-400 ui:text-sm ui:font-medium ui:uppercase ui:tracking-wider ui:mb-1">Risk Score</p>
                <p className="ui:text-zinc-500 ui:text-xs ui:italic">DrivePro AI Engine</p>
              </div>
              <div className="ui:text-5xl ui:font-black ui:text-teal-400">
                {activeFault?.riskScore ? `${Math.round(activeFault.riskScore)}%` : "N/A"}
              </div>
           </div>
        </div>
      </IntelligencePane>

      {activeFault && showVideoPlayer && (
        <WatchClipModal
          isOpen={isClipModalOpen}
          onClose={() => setIsClipModalOpen(false)}
          videoUrl={videoUrl!}
          startTime={activeFault.video_offset_seconds || 0}
        />
      )}
    </div>
  );
}
