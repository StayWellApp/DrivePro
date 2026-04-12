import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import Shell from "../Shell";

export default async function FinancesPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ branchId?: string }>;
}) {
  const { locale } = await params;
  const { branchId } = await searchParams;
  const t = await getTranslations({ locale, namespace: "Finances" });

  const schoolId = "default-school";

  const branches = await prisma.branch.findMany({
    where: { school_id: schoolId }
  });

  const queryFilter: any = { school_id: schoolId };
  if (branchId) {
    queryFilter.student = { branch_id: branchId };
  }

  const earningsByStatus = await (prisma as any).payment.groupBy({
    by: ['status'],
    where: queryFilter,
    _sum: { amount: true }
  });

  const stripeIncome = earningsByStatus.find((e: any) => e.status === 'completed')?._sum.amount || 0;
  const cashIncome = earningsByStatus.find((e: any) => e.status === 'CASH_PAYMENT')?._sum.amount || 0;
  const totalIncome = stripeIncome + cashIncome;

  const vatRate = 0.21;
  const basePrice = totalIncome / (1 + vatRate);
  const vatAmount = totalIncome - basePrice;

  const recentPayments = await (prisma as any).payment.findMany({
    where: queryFilter,
    include: { student: true },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  return (
    <Shell title={t("title")}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
             <select
                className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold"
                defaultValue={branchId || ""}
             >
                <option value="">{t("allBranches") || "All Branches"}</option>
                {branches.map(b => (
                   <option key={b.id} value={b.id}>{b.name}</option>
                ))}
             </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0F172A]/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">{t("totalEarnings")}</p>
            <p className="text-4xl font-black text-slate-900 relative z-10">{totalIncome.toLocaleString()} CZK</p>
          </div>
          <div className="p-8 bg-teal-50 rounded-2xl border border-teal-100 shadow-sm">
            <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">{t("stripeTopups") || "Stripe Top-ups"}</p>
            <p className="text-4xl font-black text-teal-900">{stripeIncome.toLocaleString()} CZK</p>
          </div>
          <div className="p-8 bg-amber-50 rounded-2xl border border-amber-100 shadow-sm">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">{t("manualCash") || "Manual Cash"}</p>
            <p className="text-4xl font-black text-amber-900">{cashIncome.toLocaleString()} CZK</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="p-8 bg-[#0F172A] text-white rounded-[32px] shadow-2xl">
              <h3 className="text-xs font-black text-teal-400 uppercase tracking-[0.2em] mb-6">VAT Calculator (21%)</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-end border-b border-white/10 pb-4">
                    <p className="text-zinc-400 text-sm font-medium">Base Price (Net)</p>
                    <p className="text-2xl font-bold">{basePrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} CZK</p>
                 </div>
                 <div className="flex justify-between items-end border-b border-white/10 pb-4">
                    <p className="text-zinc-400 text-sm font-medium">VAT Amount</p>
                    <p className="text-2xl font-bold text-teal-400">{vatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} CZK</p>
                 </div>
                 <div className="flex justify-between items-end pt-4">
                    <p className="text-zinc-400 text-sm font-medium">Gross Total</p>
                    <p className="text-3xl font-black">{totalIncome.toLocaleString()} CZK</p>
                 </div>
              </div>
           </div>

           <div className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <span className="material-symbols-outlined text-3xl">download</span>
              </div>
              <h3 className="font-black uppercase tracking-tight mb-2">Export Accounting</h3>
              <p className="text-slate-500 text-sm mb-6">Download monthly CSV reports with VAT separation for local filing.</p>
              <button className="px-8 py-3 bg-[#0F172A] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-95 transition-transform">
                Generate Export
              </button>
           </div>
        </div>

        <section>
          <h2 className="text-2xl font-black mb-6">{t("recentPayments")}</h2>
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">{t("student")}</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">{t("amount")}</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">{t("method")}</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">{t("date")}</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((payment: any) => (
                  <tr key={payment.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="p-6 font-bold">{payment.student?.name || '---'}</td>
                    <td className="p-6 font-black text-slate-900">{payment.amount.toLocaleString()} CZK</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-tighter ${payment.status === 'completed' ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'}`}>
                        {payment.status === 'completed' ? 'Stripe' : 'Manual Cash'}
                      </span>
                    </td>
                    <td className="p-6 text-sm text-slate-500 font-medium">
                      {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(payment.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Shell>
  );
}
