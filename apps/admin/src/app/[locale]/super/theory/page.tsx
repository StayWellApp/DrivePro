import Shell from "../../Shell";
import { prisma } from "../../../lib/prisma";

export default async function GlobalTheoryBank() {
  const questions = await prisma.theoryQuestion.findMany({
    include: { country: true },
    orderBy: { createdAt: 'desc' }
  });

  const countries = await prisma.country.findMany();

  return (
    <Shell
      title="Global Theory Bank"
      subtitle="Manage curriculum and examination questions across multiple jurisdictions."
    >
      <div className="flex justify-between items-center mb-12">
         <div className="flex gap-4">
            {countries.map(c => (
               <div key={c.id} className="px-6 py-2 bg-white rounded-full border border-slate-100 shadow-sm flex items-center gap-3">
                  <span className="w-8 h-5 bg-slate-100 rounded flex items-center justify-center text-[10px] font-black">{c.isoCode}</span>
                  <span className="text-sm font-bold">{c.name}</span>
               </div>
            ))}
         </div>
         <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-95 transition-transform">
            <span className="material-symbols-outlined text-sm">add</span>
            New Question
         </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
           <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                 <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Jurisdiction</th>
                 <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Question Content</th>
                 <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {questions.map(q => (
                 <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 align-top">
                       <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {q.country?.isoCode || 'Global'}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                       <p className="font-bold text-slate-900 mb-2 max-w-2xl">{q.question}</p>
                       <div className="flex gap-2">
                          {JSON.parse(JSON.stringify(q.options)).map((opt: string, i: number) => (
                             <span key={i} className={`text-[10px] px-2 py-1 rounded ${opt === q.answer ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {opt}
                             </span>
                          ))}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right align-top">
                       <div className="flex justify-end gap-2">
                          <button className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all" title="Clone & Translate">
                             <span className="material-symbols-outlined text-sm">translate</span>
                          </button>
                          <button className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all">
                             <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                       </div>
                    </td>
                 </tr>
              ))}
           </tbody>
        </table>
      </div>
    </Shell>
  );
}
