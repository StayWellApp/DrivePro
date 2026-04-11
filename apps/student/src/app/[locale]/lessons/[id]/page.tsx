import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import LessonMapWrapper from "@/components/LessonMapWrapper";

interface FaultPin {
  id: string;
  category: string;
  notes: string | null;
  lat: number;
  lng: number;
  timestamp: Date;
  video_offset_seconds: number | null;
  riskScore: number | null;
}

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "LessonDetail" });

  let lesson: any = null;
  try {
    lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        instructor: true,
        vehicle: true,
      },
    });
  } catch (err) {
    console.error("Failed to load lesson:", err);
  }

  if (!lesson) {
    notFound();
  }

  // Fetch GeoJSON and faults
  let routeCoordinates: [number, number][] = [];
  try {
    const routeData: any[] = await prisma.$queryRaw`
      SELECT ST_AsGeoJSON(gps_route) as geojson
      FROM "LessonSession"
      WHERE lesson_id = ${id}
      LIMIT 1;
    `;
    if (routeData.length > 0 && routeData[0].geojson) {
      const geojson = JSON.parse(routeData[0].geojson);
      if (geojson.type === "LineString" && Array.isArray(geojson.coordinates)) {
        routeCoordinates = geojson.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
      }
    }
  } catch (error) {
    console.error("Error fetching GPS route:", error);
  }

  let faults: FaultPin[] = [];
  try {
    const faultData = await prisma.faultPin.findMany({
      where: {
        lessonSession: {
          lesson_id: id,
        },
      },
      orderBy: { timestamp: 'asc' }
    });

    faults = faultData.map((f: any) => ({
      id: f.id,
      category: f.category,
      notes: f.notes || "No detailed notes provided for this incident.",
      lat: f.latitude,
      lng: f.longitude,
      timestamp: f.timestamp,
      video_offset_seconds: f.video_offset_seconds,
      riskScore: f.riskScore || null,
    }));
  } catch (error) {
    console.error("Error fetching FaultPins:", error);
  }

  // Calculate distance
  let distanceKm = 0;
  if (routeCoordinates.length > 1) {
    for (let i = 0; i < routeCoordinates.length - 1; i++) {
      const [lat1, lon1] = routeCoordinates[i];
      const [lat2, lon2] = routeCoordinates[i + 1];
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distanceKm += R * c;
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Map View Area (Top Half) */}
      <section className="relative h-[460px] w-full overflow-hidden">
        <LessonMapWrapper route={routeCoordinates} faults={faults} />

        {/* Map Overlay Intelligence Pane */}
        <div className="absolute top-6 right-6 w-72 glass-panel p-5 rounded-xl border border-white/20 shadow-2xl z-[400] bg-white/70 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold tracking-tight text-on-surface uppercase">Route Intelligence</h3>
            <span className="flex h-2 w-2 rounded-full bg-secondary-fixed animate-pulse"></span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-xs text-on-surface-variant font-medium">{t("distance")}</span>
              <span className="text-lg font-bold text-on-surface">{distanceKm.toFixed(1)} km</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xs text-on-surface-variant font-medium">Top Speed</span>
              <span className="text-lg font-bold text-on-surface">54 km/h</span>
            </div>
            <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
              <div className="bg-secondary-fixed h-full w-[85%]"></div>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">Route focus: Roundabout exits and high-speed merging maneuvers.</p>
          </div>
        </div>
      </section>

      {/* Bottom Analysis Split View */}
      <section className="flex flex-1 overflow-hidden p-6 gap-6">
        {/* Left Column: Dashcam Player */}
        <div className="w-7/12 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-on-surface">Dashcam Footage</h2>
            <div className="flex space-x-2">
              <span className="bg-error/10 text-error text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter">Event Flagged</span>
              <span className="bg-secondary-container/30 text-on-secondary-container text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter">HD 1080P</span>
            </div>
          </div>
          <div className="relative flex-1 bg-black rounded-xl overflow-hidden group shadow-lg min-h-[300px]">
            <img className="w-full h-full object-cover opacity-80" alt="POV dashcam" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwxiosWAH7zQs8xN_MLyc2S9N7WUwE3nzqUNC7CMOkrWDVfjH-H9CBPRDd2pwEpXlozEkp7WCUAvi3WDzDEg5doWTox0fd-9n3NoDABP93-zIHGs3FxgVTfOt80Py09tTC4wAlPukPigQ1OWiDpwdSzLIULonRCTYzRQV2fz2tyLVSCoctiZX6QNEke6a1rxhPGrKbykVK5_KxXP5rZJrF7yUhP0ChK9hTaaJAUhJntAZkYEv2zyFF8cV0iy0n4FtxQ7Xm1v8IJQ"/>
            {/* Video Controls Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
              <div className="w-full h-1 bg-white/20 rounded-full mb-4 relative">
                <div className="absolute left-0 top-0 bottom-0 w-2/3 bg-secondary-fixed rounded-full"></div>
                <div className="absolute left-2/3 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-4 border-secondary-fixed rounded-full shadow-lg"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className="text-white hover:text-secondary-fixed transition-colors">
                    <span className="material-symbols-outlined text-3xl">play_arrow</span>
                  </button>
                  <span className="text-xs font-mono text-white/80">14:02 / 45:00</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="material-symbols-outlined text-white text-xl">volume_up</span>
                  <span className="material-symbols-outlined text-white text-xl">fullscreen</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Instructor Notes & Timeline */}
        <div className="w-5/12 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-on-surface">{t("instructorNotes")}</h2>
            <button className="text-[11px] font-bold text-secondary flex items-center hover:underline">
              <span className="material-symbols-outlined text-sm mr-1">download</span>
              EXPORT PDF
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
            {faults.length === 0 ? (
               <div className="bg-secondary-container/10 p-5 rounded-xl border border-secondary-fixed/20 text-center">
                  <p className="text-sm font-bold text-on-secondary-container">{t("noFaults")}</p>
               </div>
            ) : (
              faults.map((fault) => (
                <div key={fault.id} className={`p-5 rounded-xl transition-all hover:bg-surface-bright group border border-transparent hover:border-outline-variant/10 shadow-sm ${fault.riskScore && fault.riskScore > 5 ? 'bg-error-container/10' : 'bg-surface-container-lowest'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <span className={`font-mono text-xs font-bold mr-3 ${fault.riskScore && fault.riskScore > 5 ? 'text-error' : 'text-on-primary-container'}`}>
                        {fault.video_offset_seconds ? `${Math.floor(fault.video_offset_seconds / 60)}:${(fault.video_offset_seconds % 60).toString().padStart(2, '0')}` : '00:00'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${fault.riskScore && fault.riskScore > 5 ? 'bg-error/10 text-error' : 'bg-secondary-container/30 text-on-secondary-container'}`}>
                        {fault.category}
                      </span>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-on-surface mb-1">{fault.category}</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{fault.notes}</p>
                </div>
              ))
            )}

            <div className="p-5 rounded-xl border border-dashed border-outline-variant">
              <p className="text-xs italic text-on-surface-variant text-center">End of session analysis.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
