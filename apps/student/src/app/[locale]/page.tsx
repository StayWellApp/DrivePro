import { auth } from "@/auth";
import { prisma } from "@repo/database";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import ProgressRadarChart from "@/components/ProgressRadarChart";

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
    student = await prisma.student.findUnique({
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
      <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">
            Welcome, {session.user.email}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            We couldn't find your student profile. Please contact your driving
            school.
          </p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const nextLesson = student.lessons.find((l) => l.startTime > now);
  const completedLessons = student.lessons.filter(
    (l) => (l.endTime && l.endTime <= now) || l.telemetryChunks.length > 0
  );

  const totalMinutes = completedLessons.reduce((acc, lesson) => {
    if (lesson.startTime && lesson.endTime) {
      return (
        acc + (lesson.endTime.getTime() - lesson.startTime.getTime()) / 60000
      );
    }
    return acc;
  }, 0);
  const totalHours = Math.floor(totalMinutes / 60);

  // Radar Chart Data Logic
  const last5Lessons = completedLessons.slice(0, 5);
  const categories = [
    "Observation",
    "Vehicle Control",
    "Speed Management",
    "Awareness",
    "Signage",
  ];

  const faultCounts: Record<string, number> = {};
  categories.forEach(c => faultCounts[c] = 0);

  last5Lessons.forEach(lesson => {
    // Count from sessions/faultPins
    lesson.sessions.forEach(session => {
       session.faultPins.forEach(pin => {
          if (categories.includes(pin.category)) {
             faultCounts[pin.category] += (pin.riskScore && pin.riskScore > 50 ? 3 : 1);
          }
       });
    });
    // Count from telemetryChunks
    lesson.telemetryChunks.forEach((chunk: any) => {
       if (Array.isArray(chunk.faults)) {
          chunk.faults.forEach((f: any) => {
             if (categories.includes(f.type)) {
                faultCounts[f.type] += (f.severity === 'dangerous' ? 5 : f.severity === 'serious' ? 3 : 1);
             }
          });
       }
    });
  });

  const radarData = categories.map(cat => ({
    subject: cat,
    A: Math.max(20, 100 - (faultCounts[cat] * 4)), // Score starts at 100, drops per fault
    fullMark: 100,
  }));

  const latestMock = student.theoryResults
    .filter((r) => r.mode === "mock")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

  const theoryProgress = latestMock
    ? Math.round((latestMock.score / latestMock.total) * 100)
    : 0;

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
                <div className="flex items-center gap-12">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-teal-500/30 bg-slate-700 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-400">
                        person
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        {t("instructor")}
                      </p>
                      <p className="font-bold">{nextLesson.instructor.name}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      {t("vehicle")}
                    </p>
                    <p className="font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">
                        electric_car
                      </span>
                      {nextLesson.vehicle.make} {nextLesson.vehicle.model}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8">
                <h3 className="text-3xl font-extrabold tracking-tight mb-2">
                  {t("noUpcoming")}
                </h3>
                <p className="text-slate-400">
                  Book your next session to stay on track.
                </p>
              </div>
            )}
          </div>
          <Link
            href={`/${locale}/lessons`}
            className="mt-10 relative z-10 w-fit px-8 py-3 bg-teal-500 text-slate-900 font-bold rounded-lg hover:bg-teal-400 transition-all hover:scale-[1.02] active:scale-95"
          >
            {t("manageBooking")}
          </Link>
        </section>

        {/* Finance & Theory Shortcuts */}
        <section className="lg:col-span-5 grid grid-cols-1 gap-4">
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                   Credits
                </p>
                <p className="text-3xl font-black text-teal-600">
                  {student.lessonCredits}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Balance
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {student.balance} CZK
                </p>
              </div>
            </div>
            <Link
              href={`/${locale}/topup`}
              className="mt-4 inline-block text-sm font-bold text-slate-900 hover:text-teal-600 transition-colors"
            >
              Get more credits →
            </Link>
          </div>
          <Link
            href={`/${locale}/theory`}
            className="group flex items-center justify-between p-6 bg-white rounded-xl hover:bg-slate-50 transition-all shadow-sm border border-slate-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                <span className="material-symbols-outlined">quiz</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-900">
                  {t("practiceTheory")}
                </p>
                <p className="text-xs text-slate-500">{t("takeMockExam")}</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-300 group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </Link>
        </section>

        {/* Intelligence Performance Radar */}
        <section className="lg:col-span-4 bg-[#0F172A] p-8 rounded-xl shadow-xl border border-white/5 flex flex-col justify-center">
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
                Skills Intelligence
            </h4>
            <ProgressRadarChart data={radarData} />
            <p className="text-center text-slate-500 text-[10px] font-bold uppercase tracking-tighter mt-4">
                Based on last 5 sessions
            </p>
        </section>

        {/* Completed Lessons */}
        <section className="lg:col-span-8 bg-white p-8 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <h4 className="text-2xl font-extrabold tracking-tight mb-8">
            RECENT SESSIONS
          </h4>
          {completedLessons.length === 0 ? (
             <p className="text-slate-500 italic text-center py-8">No lessons completed yet.</p>
          ) : (
            <div className="space-y-4">
              {completedLessons.slice(0, 3).map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/${locale}/lessons/${lesson.id}`}
                  className="p-4 border border-slate-100 rounded-xl hover:border-teal-500/30 transition-all group flex justify-between items-center"
                >
                  <div className="flex gap-6 items-center">
                    <div className="text-center min-w-[60px]">
                         <p className="text-[10px] font-black uppercase text-slate-400">
                            {lesson.startTime.toLocaleDateString(locale, { month: 'short' })}
                         </p>
                         <p className="text-xl font-black text-slate-900 leading-none">
                            {lesson.startTime.getDate()}
                         </p>
                    </div>
                    <div>
                        <p className="font-bold text-slate-900">Session Replay</p>
                        <p className="text-xs text-slate-400 font-medium">with {lesson.instructor.name}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-teal-500 opacity-0 group-hover:opacity-100 transition-all">play_circle</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
