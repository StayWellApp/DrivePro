import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function LessonsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LessonsList" });

  // TODO: Get actual logged-in student ID from session/auth
  // For demonstration, we'll fetch the first student available in the DB
  let firstStudent = null;
  try {
      firstStudent = await prisma.student.findFirst();
  } catch(e) {}

  const studentId = firstStudent?.id || "mock-student-id";

  let lessons: any[] = [];
  try {
      lessons = await prisma.lesson.findMany({
        where: {
          student_id: studentId,
        },
        orderBy: {
          startTime: "desc",
        },
        include: {
          instructor: true,
          vehicle: true,
        },
      });
  } catch(e) {}

  const now = new Date();
  const pastLessons = lessons.filter((l: any) => l.endTime && l.endTime <= now);
  const upcomingLessons = lessons.filter((l: any) => !l.endTime || l.endTime > now);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
          {t("title")}
        </h1>
        <p className="text-zinc-500">{t("description")}</p>
      </header>

      {/* Upcoming Lessons */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-400">
          {t("upcoming")}
        </h2>
        {upcomingLessons.length === 0 ? (
          <p className="text-zinc-500 italic bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800">
            {t("noUpcoming")}
          </p>
        ) : (
          <div className="grid gap-4">
            {upcomingLessons.map((lesson: any) => (
              <div
                key={lesson.id}
                className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="text-lg font-medium">
                    {formatDate(lesson.startTime)}
                  </div>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-xs font-semibold rounded-full uppercase tracking-wider">
                    {t("scheduled")}
                  </span>
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                  <p>
                    <strong>{t("instructor")}:</strong> {lesson.instructor?.name || "N/A"}
                  </p>
                  <p>
                    <strong>{t("vehicle")}:</strong> {lesson.vehicle?.make} {lesson.vehicle?.model} ({lesson.vehicle?.licensePlate})
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past Lessons */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
          {t("past")}
        </h2>
        {pastLessons.length === 0 ? (
          <p className="text-zinc-500 italic bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800">
            {t("noPast")}
          </p>
        ) : (
          <div className="grid gap-4">
            {pastLessons.map((lesson: any) => (
              <Link href={`/${locale}/lessons/${lesson.id}`} key={lesson.id} className="block group">
                <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:border-blue-400 hover:shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-lg font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {formatDate(lesson.startTime)}
                    </div>
                    <span className="px-3 py-1 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-semibold rounded-full uppercase tracking-wider">
                      {t("completed")}
                    </span>
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1 mb-4">
                    <p>
                      <strong>{t("instructor")}:</strong> {lesson.instructor?.name || "N/A"}
                    </p>
                    <p>
                      <strong>{t("vehicle")}:</strong> {lesson.vehicle?.make} {lesson.vehicle?.model} ({lesson.vehicle?.licensePlate})
                    </p>
                  </div>
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center">
                    {t("viewReplay")} &rarr;
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
