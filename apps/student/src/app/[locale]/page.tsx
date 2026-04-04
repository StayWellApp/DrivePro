import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function StudentHub({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Dashboard" });

  // Get current student
  const DEMO_STUDENT_ID = "student_1";

  let student = null;
  try {
    student = await prisma.student.findUnique({
      where: { id: DEMO_STUDENT_ID },
      include: {
        lessons: {
          include: {
            instructor: true,
            vehicle: true,
            sessions: true,
          },
          orderBy: {
            startTime: "asc",
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
          <h2 className="text-xl font-semibold mb-2">Welcome to your Portal</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            System is ready, but no student data was found. Please ensure the database is seeded.
          </p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const nextLesson = student.lessons.find((l) => l.startTime > now);
  const completedLessons = student.lessons.filter((l) => l.endTime && l.endTime <= now);

  // Calculate practical hours
  const totalMinutes = completedLessons.reduce((acc, lesson) => {
    if (lesson.startTime && lesson.endTime) {
      return acc + (lesson.endTime.getTime() - lesson.startTime.getTime()) / 60000;
    }
    return acc;
  }, 0);
  const totalHours = Math.floor(totalMinutes / 60);

  // Theory progress
  const latestMock = student.theoryResults
    .filter((r) => r.mode === "mock")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

  const theoryProgress = latestMock ? Math.round((latestMock.score / latestMock.total) * 100) : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Hero Card: Next Lesson (6 Columns) */}
        <section className="lg:col-span-7 flex flex-col justify-between p-8 rounded-xl bg-gradient-to-br from-primary-container to-[#1a2540] text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-fixed/10 blur-[80px] rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-secondary-fixed">event_available</span>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-primary-container">{t("upcomingSession")}</p>
            </div>
            {nextLesson ? (
              <>
                <h3 className="text-4xl font-extrabold tracking-tight mb-2">
                  {new Intl.DateTimeFormat(locale, { weekday: 'long', hour: 'numeric', minute: 'numeric' }).format(nextLesson.startTime)}
                </h3>
                <p className="text-on-primary-container text-lg mb-8">Lesson #{student.lessons.indexOf(nextLesson) + 1}: Advanced Driving Techniques</p>
                <div className="flex items-center gap-12">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-secondary-fixed/30">
                      <img
                        alt="Instructor"
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjeJ5sqnNHhU43qvHDDdyqXwBHtWpIpKVvDT-ycMbXLLf1SlRmVUZGSpd7XM9k_Kot6sVMe0Laoof80lQgPtsMB5QSpMV2idX5QTzJEMp8yRxAb7dEpA8_O10DWVkYrH_S6aFyNo3PLzrLB-rCCAkW9F8mBPpSEJjt2cadgugTvzWdyEsXHp2OVvM0vMGAnmNS9ZlxOLOcxSu03oSf_R5esO2dpEBCKV0V1xhjqcE4NuBdJcTYkM6VV6iSnTCdrniHIFAGz-mSSg"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-on-primary-container font-bold uppercase tracking-wider">{t("instructor")}</p>
                      <p className="font-bold">{nextLesson.instructor.name}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-on-primary-container font-bold uppercase tracking-wider">{t("vehicle")}</p>
                    <p className="font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">electric_car</span>
                      {nextLesson.vehicle.make} {nextLesson.vehicle.model}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <h3 className="text-3xl font-extrabold tracking-tight mb-8">{t("noUpcoming")}</h3>
            )}
          </div>
          <Link href={`/${locale}/lessons`} className="mt-10 relative z-10 w-fit px-8 py-3 bg-secondary-fixed text-on-secondary-fixed font-bold rounded-lg hover:bg-secondary-fixed-dim transition-all hover:scale-[1.02] active:scale-95">
            {t("manageBooking")}
          </Link>
        </section>

        {/* Quick Actions (5 Columns) */}
        <section className="lg:col-span-5 grid grid-cols-1 gap-4">
          <Link href={`/${locale}/lessons`} className="group flex items-center justify-between p-6 bg-surface-container-lowest rounded-xl hover:bg-surface-bright transition-all shadow-sm border border-outline-variant/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-secondary-container/30 flex items-center justify-center text-on-secondary-container">
                <span className="material-symbols-outlined">add_circle</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-on-surface">{t("bookLesson")}</p>
                <p className="text-xs text-on-surface-variant">{t("scheduleSession")}</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
          </Link>
          <Link href={`/${locale}/theory`} className="group flex items-center justify-between p-6 bg-surface-container-lowest rounded-xl hover:bg-surface-bright transition-all shadow-sm border border-outline-variant/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-tertiary-fixed/30 flex items-center justify-center text-on-tertiary-container">
                <span className="material-symbols-outlined">quiz</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-on-surface">{t("practiceTheory")}</p>
                <p className="text-xs text-on-surface-variant">{t("takeMockExam")}</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
          </Link>
          <Link href={`/${locale}/finances`} className="group flex items-center justify-between p-6 bg-surface-container-lowest rounded-xl hover:bg-surface-bright transition-all shadow-sm border border-outline-variant/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined">folder_open</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-on-surface">{t("viewFinances")}</p>
                <p className="text-xs text-on-surface-variant">{t("managePayments")}</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
          </Link>
        </section>

        {/* Progress Tracker (12 Columns) */}
        <section className="lg:col-span-12 bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h4 className="text-2xl font-extrabold tracking-tight">{t("progressTracker")}</h4>
              <p className="text-sm text-on-surface-variant">{t("journeyProgress")}</p>
            </div>
            <div className="flex gap-2">
              <div className="px-4 py-2 bg-secondary-container/20 text-on-secondary-container rounded-full text-xs font-bold uppercase tracking-wider">Estimated Test: Oct 2025</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Circular Gauge */}
            <div className="flex items-center gap-8">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle className="text-surface-container-high" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12"></circle>
                  <circle
                    className="text-secondary"
                    cx="80"
                    cy="80"
                    fill="transparent"
                    r="70"
                    stroke="currentColor"
                    strokeDasharray="440"
                    strokeDashoffset={440 - (440 * Math.min(totalHours, 28)) / 28}
                    strokeWidth="12"
                    strokeLinecap="round"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-3xl font-black">{totalHours}</p>
                  <p className="text-[10px] font-bold uppercase text-on-surface-variant">of 28 Hours</p>
                </div>
              </div>
              <div>
                <h5 className="font-bold mb-2">{t("drivingHours")}</h5>
                <p className="text-sm text-on-surface-variant leading-relaxed">{t("drivingHoursDesc")}</p>
              </div>
            </div>
            {/* Horizontal Progress Bars */}
            <div className="space-y-8">
              <div>
                <div className="flex justify-between mb-3">
                  <p className="text-sm font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-primary">school</span>
                    {t("theoryProgress")}
                  </p>
                  <p className="text-sm font-black text-secondary">{theoryProgress}%</p>
                </div>
                <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: `${theoryProgress}%` }}></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-surface-container-low rounded-lg">
                  <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-1">{t("passProbability")}</p>
                  <p className="text-xl font-black text-on-tertiary-container">{theoryProgress > 70 ? "High" : theoryProgress > 40 ? "Medium" : "Low"}</p>
                </div>
                <div className="p-4 bg-surface-container-low rounded-lg">
                  <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-1">{t("sectionsDone")}</p>
                  <p className="text-xl font-black text-on-tertiary-container">{student.theoryResults.length} / 14</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Intelligence Pane / Recent Insights (Bottom Grid) */}
        <section className="lg:col-span-12 glass-panel p-8 rounded-xl border border-outline-variant/10 bg-surface-container-lowest/70 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-secondary font-variation-settings: 'FILL' 1;">insights</span>
            <h4 className="font-bold uppercase tracking-widest text-xs">{t("intelligenceInsights")}</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-bold">Top Performer</p>
              <p className="text-xs text-on-surface-variant">Your hazard perception scores are in the top 5% of all students this week.</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold">Improvement Area</p>
              <p className="text-xs text-on-surface-variant">Focus on 'Vehicle Maintenance' questions in your next theory practice.</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold">Badge Earned</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-secondary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px] text-on-secondary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                </div>
                <p className="text-xs font-semibold">Perfect Parking Streak</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
