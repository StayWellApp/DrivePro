"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
  CircleMarker,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import TelemetryScrubber from "./TelemetryScrubber";
import IntelligencePane from "./IntelligencePane";
import { useTranslations } from "next-intl";

// Fix Leaflet icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Helper component to adjust map bounds to fit the route
function MapBounds({ route }: { route: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (route && route.length > 0) {
      const bounds = L.latLngBounds(route);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, route]);
  return null;
}

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

export default function LessonMap({ route, faults, videoUrl }: LessonMapProps) {
  const t = useTranslations("LessonDetail");
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeFault, setActiveFault] = useState<FaultPin | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const seekVideo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, seconds);
      videoRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleScrub = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Interpolate car position based on current time
  const carPosition = useMemo(() => {
    if (!route || route.length === 0 || duration === 0) return null;

    const progress = currentTime / duration;
    const index = Math.floor(progress * (route.length - 1));
    const nextIndex = Math.min(index + 1, route.length - 1);

    if (index === nextIndex) return route[index];

    const segmentProgress = progress * (route.length - 1) - index;
    const [lat1, lng1] = route[index];
    const [lat2, lng2] = route[nextIndex];

    return [
      lat1 + (lat2 - lat1) * segmentProgress,
      lng1 + (lng2 - lng1) * segmentProgress,
    ] as [number, number];
  }, [route, currentTime, duration]);

  if (!mounted) {
    return (
      <div className="h-[600px] w-full bg-zinc-950 animate-pulse rounded-3xl border border-white/5"></div>
    );
  }

  const defaultCenter: [number, number] = [49.8175, 15.473];
  const center = route.length > 0 ? route[0] : defaultCenter;

  return (
    <div className="relative space-y-6 group">
      {videoUrl && (
        <div className="w-full aspect-video bg-zinc-950 rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
          <video
            ref={videoRef}
            src={videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      )}

      <div className="h-[500px] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative z-0">
        <MapContainer center={center} zoom={13} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {route && route.length > 0 && (
            <>
              <Polyline
                positions={route}
                color="#2DD4BF"
                weight={6}
                opacity={0.6}
              />
              <MapBounds route={route} />

              {/* Start/End indicators */}
              <CircleMarker
                center={route[0]}
                radius={8}
                pathOptions={{
                  color: "#FFFFFF",
                  fillColor: "#2DD4BF",
                  fillOpacity: 1,
                }}
              >
                <Popup>{t("start")}</Popup>
              </CircleMarker>
              {route.length > 1 && (
                <CircleMarker
                  center={route[route.length - 1]}
                  radius={8}
                  pathOptions={{
                    color: "#FFFFFF",
                    fillColor: "#EF4444",
                    fillOpacity: 1,
                  }}
                >
                  <Popup>{t("end")}</Popup>
                </CircleMarker>
              )}
            </>
          )}

          {/* Moving Car Cursor */}
          {carPosition && (
            <Marker
              position={carPosition}
              icon={L.divIcon({
                className: "custom-car-icon",
                html: `<div class="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-2xl ring-4 ring-teal-500/30">
                        <div class="w-3 h-3 bg-zinc-950 rounded-full animate-ping"></div>
                      </div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
              })}
            />
          )}

          {faults &&
            faults.map((fault) => (
              <Marker
                key={fault.id}
                position={[fault.lat, fault.lng]}
                eventHandlers={{
                  click: () => {
                    if (fault.video_offset_seconds !== null) {
                      seekVideo(fault.video_offset_seconds - 5);
                    }
                    setActiveFault(fault);
                  },
                }}
                icon={L.divIcon({
                  className: "custom-fault-icon",
                  html: `<div class="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-red-600/30 hover:scale-110 transition-transform cursor-pointer">
                        <span class="text-white font-bold text-xs">${fault.category[0]}</span>
                      </div>`,
                  iconSize: [40, 40],
                  iconAnchor: [20, 20],
                })}
              >
                <Popup className="custom-popup">
                  <div className="p-2">
                    <strong className="block text-zinc-950 mb-1">
                      {fault.category}
                    </strong>
                    <p className="text-zinc-600 text-xs mb-3">
                      {t("replayAnalysis")}
                    </p>
                    <button
                      onClick={() => {
                        if (fault.video_offset_seconds !== null) {
                          seekVideo(fault.video_offset_seconds - 5);
                        }
                        setActiveFault(fault);
                      }}
                      className="w-full py-2 bg-zinc-900 text-white rounded-lg font-bold text-xs hover:bg-zinc-800 transition"
                    >
                      {t("replayIncident")}
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-4xl px-8 z-[900]">
        <TelemetryScrubber
          currentTime={currentTime}
          duration={duration}
          onChange={handleScrub}
        />
      </div>

      <IntelligencePane
        isVisible={!!activeFault}
        onClose={() => setActiveFault(null)}
        fault={activeFault}
      />
    </div>
  );
}
