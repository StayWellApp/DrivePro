import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import LessonMapWrapper from "../../../../components/LessonMapWrapper";

interface FaultPin {
  id: string;
  category: string;
  notes: string | null;
  lat: number;
  lng: number;
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

  // Calculate Duration
  let durationMins = 0;
  if (lesson.endTime) {
    durationMins = Math.round((lesson.endTime.getTime() - lesson.startTime.getTime()) / 60000);
  } else {
    durationMins = Math.round((new Date().getTime() - lesson.startTime.getTime()) / 60000);
  }

  // Fetch GeoJSON and faults using $queryRaw as gps_route is Unsupported and FaultPin might be missing from schema typings
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
        // GeoJSON uses [lng, lat], Leaflet uses [lat, lng]
        routeCoordinates = geojson.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
      }
    }
  } catch (error) {
    console.error("Error fetching GPS route:", error);
  }

  let faults: FaultPin[] = [];
  try {
    // If PostGIS is not available or location is lat/lng fields
    const faultData = await prisma.faultPin.findMany({
      where: {
        lessonSession: {
          lesson_id: id,
        },
      },
    });

    faults = faultData.map((f: any) => ({
      id: f.id,
      category: f.category,
      notes: f.notes || null,
      lat: f.latitude,
      lng: f.longitude,
      video_offset_seconds: f.video_offset_seconds,
      riskScore: f.riskScore || null,
    }));
  } catch (error) {
    console.error("Error fetching FaultPins:", error);
  }

  let videoUrl = "";
  try {
    const session = await prisma.lessonSession.findFirst({
      where: { lesson_id: id },
      orderBy: { createdAt: "desc" },
    });
    if (session?.video_file_name) {
      videoUrl = `https://storage.googleapis.com/drivepro-videos/${session.video_file_name}`;
    }
  } catch (error) {
    console.error("Error fetching video session:", error);
  }

  // Calculate distance based on route if we have one
  let distanceKm = 0;
  if (routeCoordinates.length > 1) {
    // Basic Haversine formula approximation
    for (let i = 0; i < routeCoordinates.length - 1; i++) {
      const [lat1, lon1] = routeCoordinates[i];
      const [lat2, lon2] = routeCoordinates[i + 1];
      const R = 6371; // km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distanceKm += R * c;
    }
  }

  // Summary by category
  const faultSummary = faults.reduce((acc, fault) => {
    acc[fault.category] = (acc[fault.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-5xl mx-auto p-8 font-sans">
      <div className="mb-6">
        <Link
          href={`/${locale}/lessons`}
          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center text-sm"
        >
          &larr; {t("backToList")}
        </Link>
      </div>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
          {t("title")}
        </h1>
        <p className="text-zinc-500">
          {new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "short" }).format(lesson.startTime)}
        </p>
      </header>

      {/* Progress Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-center items-center">
          <span className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-2">
            {t("duration")}
          </span>
          <span className="text-3xl font-bold text-zinc-900 dark:text-white">
            {durationMins} <span className="text-lg text-zinc-500 font-normal">min</span>
          </span>
        </div>

        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-center items-center">
          <span className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-2">
            {t("distance")}
          </span>
          <span className="text-3xl font-bold text-zinc-900 dark:text-white">
            {distanceKm.toFixed(1)} <span className="text-lg text-zinc-500 font-normal">km</span>
          </span>
        </div>

        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-center items-center">
          <span className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-2">
            {t("faults")}
          </span>
          <span className="text-3xl font-bold text-red-600">
            {faults.length}
          </span>
        </div>
      </div>

      {/* Map Area */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
          {t("mapRoute")}
        </h2>
        <LessonMapWrapper route={routeCoordinates} faults={faults} videoUrl={videoUrl} />
      </section>

      {/* Faults Summary Detail */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
          {t("faultSummary")}
        </h2>
        {Object.keys(faultSummary).length === 0 ? (
          <p className="text-zinc-500 italic bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800">
            {t("noFaults")}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {Object.entries(faultSummary).map(([category, count]) => (
              <div
                key={category}
                className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/50 flex justify-between items-center"
              >
                <span className="font-medium text-red-800 dark:text-red-300">
                  {category}
                </span>
                <span className="bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-100 font-bold px-3 py-1 rounded-full text-sm">
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
