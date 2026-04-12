import { getInstructorLeaderboard } from "@/lib/actions/instructor";
import { getTranslations } from "next-intl/server";
import Shell from "../../Shell";

export default async function InstructorLeaderboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Navigation" });
  const leaderboard = await getInstructorLeaderboard();

  return (
    <Shell title="Instructor Analytics" subtitle="Performance tracking and quality metrics across the fleet.">
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Top Performer</p>
              <p className="text-2xl font-black text-slate-900">{leaderboard[0]?.name || 'N/A'}</p>
              <p className="text-teal-500 font-bold text-xs mt-2">{leaderboard[0]?.passRate.toFixed(1)}% Pass Rate</p>
           </div>
           <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fleet Avg Pass Rate</p>
              <p className="text-2xl font-black text-slate-900">
                {(leaderboard.reduce((acc, curr) => acc + curr.passRate, 0) / (leaderboard.length || 1)).toFixed(1)}%
              </p>
           </div>
           <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Fleet Hours</p>
              <p className="text-2xl font-black text-slate-900">
                {leaderboard.reduce((acc, curr) => acc + curr.totalHours, 0).toLocaleString()}h
              </p>
           </div>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50">
           <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                 <tr>
                    <th className="p-8 text-xs font-black text-slate-400 uppercase tracking-widest">Rank</th>
                    <th className="p-8 text-xs font-black text-slate-400 uppercase tracking-widest">Instructor</th>
                    <th className="p-8 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Pass Rate</th>
                    <th className="p-8 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Avg. Serious Faults</th>
                    <th className="p-8 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Total Hours</th>
                 </tr>
              </thead>
              <tbody>
                 {leaderboard.map((item, index) => (
                    <tr key={item.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                       <td className="p-8">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${index === 0 ? 'bg-amber-100 text-amber-600' : index === 1 ? 'bg-slate-200 text-slate-600' : index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                             {index + 1}
                          </div>
                       </td>
                       <td className="p-8 font-black text-slate-900">{item.name}</td>
                       <td className="p-8 text-center">
                          <div className="flex flex-col items-center gap-1">
                             <span className="font-black text-teal-600">{item.passRate.toFixed(1)}%</span>
                             <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-teal-500" style={{ width: `${item.passRate}%` }} />
                             </div>
                          </div>
                       </td>
                       <td className="p-8 text-center">
                          <span className={`font-bold ${item.avgSeriousFaults > 2 ? 'text-error' : 'text-slate-500'}`}>
                             {item.avgSeriousFaults.toFixed(2)}
                          </span>
                       </td>
                       <td className="p-8 text-right font-bold text-slate-900">{item.totalHours.toLocaleString()}h</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </Shell>
  );
}
