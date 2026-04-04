'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
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
}

interface LessonMapProps {
  route: [number, number][]; // Array of [lat, lng]
  faults: FaultPin[];
  videoUrl?: string;
}

export default function LessonMap({ route, faults, videoUrl }: LessonMapProps) {
  const [mounted, setMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const seekVideo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

  if (!mounted) {
    return <div className="h-96 w-full bg-zinc-100 animate-pulse rounded-lg border border-zinc-200"></div>;
  }

  const defaultCenter: [number, number] = [49.8175, 15.4730]; // Default to Czech Republic center
  const center = route.length > 0 ? route[0] : defaultCenter;

  return (
    <div className="space-y-4">
      {videoUrl && (
        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden border border-zinc-200 shadow-sm">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="w-full h-full"
          />
        </div>
      )}

      <div className="h-96 w-full rounded-lg overflow-hidden border border-zinc-200 shadow-sm relative z-0">
        <MapContainer center={center} zoom={13} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {route && route.length > 0 && (
            <>
              <Polyline positions={route} color="#3b82f6" weight={4} opacity={0.8} />
              <MapBounds route={route} />
              {/* Start point marker */}
              <Marker position={route[0]}>
                <Popup>Start</Popup>
              </Marker>
              {/* End point marker */}
              {route.length > 1 && (
                <Marker position={route[route.length - 1]}>
                  <Popup>End</Popup>
                </Marker>
              )}
            </>
          )}

          {faults && faults.map((fault) => (
            <Marker key={fault.id} position={[fault.lat, fault.lng]}>
              <Popup>
                <div className="text-sm">
                  <strong className="block text-red-600 mb-1">{fault.category}</strong>
                  {fault.notes && <p className="text-zinc-600 mb-2">{fault.notes}</p>}
                  {fault.video_offset_seconds !== null && (
                    <button
                      onClick={() => seekVideo(fault.video_offset_seconds!)}
                      className="mt-2 text-blue-600 hover:underline font-medium"
                    >
                      Replay Video
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
