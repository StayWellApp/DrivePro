import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function SuperAdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const stats = {
    schools: await prisma.school.count(),
    students: await prisma.student.count(),
    theoryQuestions: await prisma.theoryQuestion.count(),
    passRate: "78%" // Placeholder
  };

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">Command Center</h1>
        <p className="text-slate-500 font-medium">Global infrastructure and curriculum control.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Schools", value: stats.schools, icon: "domain", color: "bg-blue-500" },
          { label: "Total Students", value: stats.students, icon: "group", color: "bg-teal-500" },
          { label: "Theory Questions", value: stats.theoryQuestions, icon: "menu_book", color: "bg-orange-500" },
          { label: "Global Pass Rate", value: stats.passRate, icon: "verified", color: "bg-purple-500" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
             <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-slate-900/10`}>
                <span className="material-symbols-outlined text-white">{stat.icon}</span>
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
             <p className="text-3xl font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-[#0F172A] text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
               <h3 className="text-2xl font-black mb-4">Curriculum Health</h3>
               <p className="text-white/60 mb-8 max-w-sm">Manage the global theory bank and ensure translation parity across all regions.</p>
               <Link href={`/${locale}/super/theory`} className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-teal-400 transition-all">
                  Theory Bank
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
               </Link>
            </div>
            <span className="material-symbols-outlined absolute -right-8 -bottom-8 text-[180px] text-white/5 group-hover:scale-110 transition-transform duration-500">menu_book</span>
         </div>

         <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm group">
            <h3 className="text-2xl font-black text-slate-900 mb-4">Platform Growth</h3>
            <p className="text-slate-500 mb-8 max-w-sm">Monitor school onboarding and expansion metrics across Europe.</p>
            <Link href={`/${locale}/super/schools`} className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-500 transition-all">
               Schools Management
               <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
         </div>
      </div>
    </div>
  );
}
