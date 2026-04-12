import { prisma } from "@/lib/prisma";
import NewQuestionForm from "./NewQuestionForm";
import BulkImportForm from "./BulkImportForm";
import TheoryTableActions from "./TheoryTableActions";

export default async function GlobalTheoryBank({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const questions = await prisma.theoryQuestion.findMany({
    include: { country: true },
    orderBy: { createdAt: 'desc' }
  });

  const countries = await prisma.country.findMany();

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">Global Theory Bank</h1>
          <p className="text-slate-500 font-medium">Manage curriculum and examination questions across multiple jurisdictions.</p>
        </div>
        <div className="flex gap-4">
           <BulkImportForm countries={countries} />
           <NewQuestionForm countries={countries} />
        </div>
      </header>

      <div className="flex gap-4">
         {countries.map(c => (
            <div key={c.id} className="px-6 py-2 bg-white rounded-full border border-slate-100 shadow-sm flex items-center gap-3">
               <span className="w-8 h-5 bg-slate-100 rounded flex items-center justify-center text-[10px] font-black">{c.isoCode}</span>
               <span className="text-sm font-bold">{c.name}</span>
            </div>
         ))}
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
           <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                 <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Jurisdiction</th>
                 <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Question Content</th>
                 <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {questions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-200 mb-4 block">inventory_2</span>
                    <p className="text-slate-400 font-bold">No questions found. Use Bulk Import to get started.</p>
                  </td>
                </tr>
              ) : questions.map(q => (
                 <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 align-top">
                       <div className="flex flex-col gap-2">
                          <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-[10px] font-black uppercase tracking-widest w-fit">
                             {q.country?.isoCode || 'Global'}
                          </span>
                          <span className={`px-3 py-1 ${q.language === 'en' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'} rounded-full text-[10px] font-black uppercase tracking-widest w-fit`}>
                             {q.language}
                          </span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <p className="font-bold text-slate-900 mb-2 max-w-2xl">{q.question}</p>
                       <div className="flex gap-2">
                          {(q.options as string[]).map((opt: string, i: number) => (
                             <span key={i} className={`text-[10px] px-2 py-1 rounded ${opt === q.answer ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {opt}
                             </span>
                          ))}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right align-top">
                       <TheoryTableActions questionId={q.id} />
                    </td>
                 </tr>
              ))}
           </tbody>
        </table>
      </div>
    </div>
  );
}
