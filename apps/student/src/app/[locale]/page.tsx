import { prisma } from "@/lib/prisma";

export default async function StudentHub({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  // Test: Fetching a count of students from the DB
  const studentCount = await prisma.student.count();

  return (
    <div className="flex flex-col min-h-screen p-8 bg-zinc-50 dark:bg-black font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">DrivePro Student Hub</h1>
        <p className="text-zinc-500">Language: {locale.toUpperCase()}</p>
      </header>

      <main className="grid gap-6">
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Welcome to your Portal</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Current system status: <span className="text-green-500 font-medium">Connected to Database</span>
          </p>
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-sm text-zinc-500">
              Total active students in system: <strong>{studentCount}</strong>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}