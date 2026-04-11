import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function StudentHub({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
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
    (l) => l.endTime && l.endTime <= now,
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

  const latestMock = student.theoryResults
    .filter((r) => r.mode === "mock")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

  const theoryProgress = latestMock
    ? Math.round((latestMock.score / latestMock.total) * 100)
    : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
                  Lesson #{student.lessons.indexOf(nextLesson) + 1}
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

        <section className="lg:col-span-5 grid grid-cols-1 gap-4">
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
              Account Balance
            </p>
            <p className="text-3xl font-black text-slate-900">
              {student.balance} CZK
            </p>
            <Link
              href={`/${locale}/topup`}
              className="mt-4 inline-block text-sm font-bold text-teal-600 hover:text-teal-700"
            >
              Top up account →
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

        <section className="lg:col-span-12 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h4 className="text-2xl font-extrabold tracking-tight">
                {t("progressTracker")}
              </h4>
              <p className="text-sm text-slate-500">{t("journeyProgress")}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex items-center gap-8">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    className="text-slate-100"
                    cx="80"
                    cy="80"
                    fill="transparent"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                  ></circle>
                  <circle
                    className="text-teal-500"
                    cx="80"
                    cy="80"
                    fill="transparent"
                    r="70"
                    stroke="currentColor"
                    strokeDasharray="440"
                    strokeDashoffset={
                      440 - (440 * Math.min(totalHours, 28)) / 28
                    }
                    strokeWidth="12"
                    strokeLinecap="round"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-3xl font-black">{totalHours}</p>
                  <p className="text-[10px] font-bold uppercase text-slate-500">
                    of 28 Hours
                  </p>
                </div>
              </div>
              <div>
                <h5 className="font-bold mb-2">{t("drivingHours")}</h5>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {t("drivingHoursDesc")}
                </p>
              </div>
            </div>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between mb-3">
                  <p className="text-sm font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-blue-600">
                      school
                    </span>
                    {t("theoryProgress")}
                  </p>
                  <p className="text-sm font-black text-teal-600">
                    {theoryProgress}%
                  </p>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{ width: `${theoryProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
