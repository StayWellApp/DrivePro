import { auth } from "@/auth";
import { prisma } from "@repo/database";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import ProgressRadarChart from "@/components/ProgressRadarChart";
import IntelligenceOverview from "@/components/IntelligenceOverview";
import SponsorLinkManager from "@/components/SponsorLinkManager";

export default async function DashboardPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect(`/${locale}/login`);
  }

  const studentId = (session.user as any).studentId;

  const t = await getTranslations({ locale, namespace: "Dashboard" });

  let student = null;
  try {
    student = await (prisma as any).student.findUnique({
      where: { id: studentId },
      include: {
        lessons: {
          include: {
            instructor: true,
            vehicle: true,
            telemetryChunks: true,
            sessions: {
              include: {
                faultPins: true
              }
            }
          },
          orderBy: {
            startTime: "desc",
          },
        },
        theoryResults: true,
      },
    });
  } catch (e) {
    console.error("Database connection error:", e);
  }

  if (!student) {
    return (
      <div className="p-8">
        <p className="text-slate-500 italic">Loading student profile...</p>
      </div>
    );
  }

  const now = new Date();
  const nextLesson = student.lessons.find(
    (l: any) => l.startTime && l.startTime > now
  );
  const completedLessons = student.lessons.filter(
    (l: any) => (l.endTime && l.endTime <= now) || l.telemetryChunks.length > 0
  );

  const totalMinutes = completedLessons.reduce((acc: number, lesson: any) => {
    if (lesson.startTime && lesson.endTime) {
      return (
        acc + (lesson.endTime.getTime() - lesson.startTime.getTime()) / 60000
      );
    }
    return acc;
  }, 0);

  const categories = [
    "Observation",
    "Vehicle Control",
    "Speed Management",
    "Awareness",
    "Signage",
  ];

  const faultCounts: Record<string, number> = {};
  categories.forEach(c => faultCounts[c] = 0);

  completedLessons.slice(0, 5).forEach((lesson: any) => {
    lesson.sessions.forEach((session: any) => {
       session.faultPins.forEach((pin: any) => {
          if (categories.includes(pin.category)) {
             faultCounts[pin.category] += (pin.riskScore && pin.riskScore > 50 ? 3 : 1);
          }
       });
    });
  });

  const radarData = categories.map(cat => ({
    subject: cat,
    A: Math.max(20, 100 - (faultCounts[cat] * 4)),
    fullMark: 100,
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Header Section */}
        <section className="lg:col-span-7 flex flex-col justify-between p-8 rounded-xl bg-gradient-to-br from-[#0F172A] to-[#1a2540] text-white relative overflow-hidden group border border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 blur-[80px] rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-teal-400">
                event_available
              </span>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
                {t("upcomingSession")}
              </p>
            </div>
            {nextLesson ? (
              <>
                <h3 className="text-4xl font-extrabold tracking-tight mb-2">
                  {new Intl.DateTimeFormat(locale, {
                    weekday: "long",
                    hour: "numeric",
                    minute: "numeric",
                  }).format(nextLesson.startTime)}
                </h3>
                <p className="text-slate-300 text-lg mb-8">
                   Lesson #{completedLessons.length + 1}
                </p>
              </>
            ) : (
              <div className="py-8">
                <h3 className="text-3xl font-extrabold tracking-tight mb-2">
                  {t("noUpcoming")}
                </h3>
              </div>
            )}
          </div>
          <Link
            href={`/${locale}/lessons`}
            className="mt-10 relative z-10 w-fit px-8 py-3 bg-teal-500 text-slate-900 font-bold rounded-lg hover:bg-teal-400"
          >
            {t("manageBooking")}
          </Link>
        </section>

        {/* Finance & Theory */}
        <section className="lg:col-span-5 grid grid-cols-1 gap-4">
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Credits</p>
            <p className="text-3xl font-black text-teal-600">{student.lessonCredits}</p>
          </div>
          <Link
            href={`/${locale}/theory`}
            className="group flex items-center justify-between p-6 bg-white rounded-xl shadow-sm border border-slate-200"
          >
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-teal-600">quiz</span>
              <div>
                <p className="font-bold text-slate-900">{t("practiceTheory")}</p>
                <p className="text-xs text-slate-500">{t("takeMockExam")}</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
          </Link>
        </section>

        {/* Readiness & Hotspots Intelligence */}
        <section className="lg:col-span-12">
           <div className="mb-8">
             <SponsorLinkManager studentId={studentId} />
           </div>

           <IntelligenceOverview studentId={studentId} />
        </section>

        {/* Intelligence Performance Radar */}
        <section className="lg:col-span-4 bg-[#0F172A] p-8 rounded-xl shadow-xl border border-white/5 flex flex-col justify-center">
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
                Skills Intelligence
            </h4>
            <ProgressRadarChart data={radarData} />
        </section>

        {/* Completed Lessons */}
        <section className="lg:col-span-8 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
           <h4 className="text-2xl font-extrabold tracking-tight mb-8">RECENT SESSIONS</h4>
           <div className="space-y-4">
              {completedLessons.slice(0, 3).map((lesson: any) => (
                <Link
                  key={lesson.id}
                  href={`/${locale}/lessons/${lesson.id}`}
                  className="p-4 border border-slate-100 rounded-xl hover:border-teal-500/30 flex justify-between items-center"
                >
                  <p className="font-bold text-slate-900">Session Replay - {lesson.startTime.toLocaleDateString()}</p>
                  <span className="material-symbols-outlined text-teal-500">play_circle</span>
                </Link>
              ))}
           </div>
        </section>
      </div>
    </div>
  );
}
