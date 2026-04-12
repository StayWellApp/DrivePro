import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

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

  const recentPayments = await (prisma as any).payment.findMany({
    where: queryFilter,
    include: { student: true },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-black tracking-tight">{t("title")}</h1>
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
        <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t("totalEarnings")}</p>
          <p className="text-4xl font-black text-slate-900">{(stripeIncome + cashIncome).toLocaleString()} CZK</p>
        </div>
        <div className="p-8 bg-teal-50 rounded-2xl border border-teal-100 shadow-sm">
          <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">{t("stripeTopups") || "Stripe Top-ups"}</p>
          <p className="text-4xl font-black text-teal-900">{stripeIncome.toLocaleString()} CZK</p>
        </div>
        <div className="p-8 bg-amber-50 rounded-2xl border border-amber-100 shadow-sm">
          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">{t("manualCash") || "Manual Cash"}</p>
          <p className="text-4xl font-black text-teal-900">{cashIncome.toLocaleString()} CZK</p>
        </div>
      </div>

      <div className="h-64 bg-slate-50 rounded-3xl border border-dashed border-slate-200 flex items-center justify-center">
         <p className="text-slate-400 font-bold italic">Revenue Breakdown Chart</p>
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
  );
}
