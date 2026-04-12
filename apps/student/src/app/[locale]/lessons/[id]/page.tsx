import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import DashcamToast from "@/components/DashcamToast";
import ReplayWrapper from "@/components/ReplayWrapper";
import LessonTour from "@/components/LessonTour";
import SupportButton from "@/components/SupportButton";

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
        school: true,
        instructor: true,
        vehicle: true,
        telemetryChunks: true,
      },
    });
  } catch (err) {
    console.error("Failed to load lesson:", err);
  }

  if (!lesson) {
    notFound();
  }

  let routePoints: { lat: number; lng: number; timestamp: string }[] = [];
  let faults: any[] = [];

  if (lesson.telemetryChunks && lesson.telemetryChunks.length > 0) {
    lesson.telemetryChunks.forEach((chunk: any) => {
      if (Array.isArray(chunk.coordinates)) {
        routePoints = [...routePoints, ...(chunk.coordinates as any[])];
      }
      if (Array.isArray(chunk.faults)) {
        faults = [...faults, ...(chunk.faults as any[]).map((f: any, idx: number) => ({
          id: `${chunk.id}-fault-${idx}`,
          ...f,
          lat: f.coordinate.lat,
          lng: f.coordinate.lng,
        }))];
      }
    });
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0F172A] text-white">
      <LessonTour />
      <header className="p-8 border-b border-white/5 flex justify-between items-end">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-teal-500 uppercase mb-4">
             <Link href={`/${locale}`} className="hover:text-white transition-colors">Dashboard</Link>
             <span className="text-white/20">/</span>
             <Link href={`/${locale}/lessons`} className="hover:text-white transition-colors">Lessons</Link>
             <span className="text-white/20">/</span>
             <span className="text-white">Replay</span>
          </nav>
          <div className="flex items-center gap-4">
             <h1 className="text-5xl font-black tracking-tighter leading-none">
                LESSON REPLAY
             </h1>
             <DashcamToast />
          </div>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              {new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(lesson.startTime)}
            </p>
            <SupportButton lessonId={id} metadata={{ chunkCount: lesson.telemetryChunks.length }} />
          </div>
        </div>
        <div className="flex gap-4">
            <div className="text-right">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Instructor</p>
                <p className="font-bold">{lesson.instructor.name}</p>
            </div>
            <div className="w-[1px] h-10 bg-white/10" />
            <div className="text-right">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Vehicle</p>
                <p className="font-bold">{lesson.vehicle.make} {lesson.vehicle.model}</p>
            </div>
        </div>
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
           <ReplayWrapper
              route={routePoints}
              videoUrl={lesson.videoUrl}
              faults={faults}
              labels={{
                start: t("start"),
                end: t("end"),
                replayAnalysis: t("replayAnalysis"),
                replayIncident: t("replayIncident")
              }}
           />
        </div>
      </main>
    </div>
  );
}
