import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function FinancesPage({
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
  const currency = (session.user as any).currency || "CZK";
  const t = await getTranslations({ locale, namespace: "Finances" });

  let student = null;
  let payments: any[] = [];
  try {
    student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (student) {
      payments = await prisma.payment.findMany({
        where: { student_id: studentId },
        orderBy: { createdAt: "desc" },
      });
    }
  } catch (e) {}

  if (!student) {
    return <div className="p-8">No student profile found.</div>;
  }

  const balance = student.balance || 0;
  // Dynamic lesson cost based on currency for demo purposes
  const lessonCost = currency === "EUR" ? 20 : (currency === "PLN" ? 80 : 500);
  const lessonEstimate = Math.floor(balance / lessonCost);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-end mb-12">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mb-2 block">
            {t("studentAccount")}
          </span>
          <h2 className="text-4xl font-extrabold tracking-tighter text-slate-900">
            {t("title")}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#0F172A] to-[#1a2540] p-10 rounded-2xl flex flex-col justify-between text-white min-h-[280px] border border-slate-800">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="material-symbols-outlined text-teal-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                account_balance_wallet
              </span>
              <span className="text-xs uppercase tracking-widest text-slate-300 font-bold">
                {t("currentBalance")}
              </span>
            </div>
            <div className="flex flex-col md:flex-row md:items-baseline md:gap-4 mt-4">
              <span className="text-7xl font-extrabold tracking-tighter">
                {balance} {currency}
              </span>
              <span className="text-2xl font-light text-slate-400">
                / {lessonEstimate} {t("lessons")}
              </span>
            </div>
          </div>
          <div className="relative z-10 flex gap-4 mt-8">
            <button className="bg-teal-500 text-slate-900 px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-teal-400 transition-all shadow-lg">
              <span className="material-symbols-outlined">add_circle</span>
              {t("topUp")}
            </button>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-teal-500 rounded-full opacity-10 blur-3xl"></div>
        </div>

        <div className="p-8 rounded-2xl flex flex-col justify-center border border-slate-200 relative overflow-hidden bg-white shadow-sm">
          <div className="mb-4">
            <div className="w-10 h-10 bg-teal-50 flex items-center justify-center rounded-lg mb-4 text-teal-600">
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            <h4 className="text-lg font-bold tracking-tight mb-2">
              {t("smartSaving")}
            </h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              {t("smartSavingDesc")}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold tracking-tight">
            {t("transactionHistory")}
          </h3>
        </div>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em]">
                  {t("transaction")}
                </th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em]">
                  {t("method")}
                </th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em]">
                  {t("date")}
                </th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-right">
                  {t("amount")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-10 text-center text-slate-400 italic"
                  >
                    No transactions found
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full ${p.status === "succeeded" ? "bg-teal-50 text-teal-600" : "bg-red-50 text-red-600"} flex items-center justify-center`}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontWeight: 700 }}
                          >
                            {p.status === "succeeded" ? "add" : "remove"}
                          </span>
                        </div>
                        <div>
                          <div className="font-bold text-sm">Credit Top-up</div>
                          <div className="text-xs text-slate-500">
                            Inv #{p.id.substring(0, 8).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 text-lg">
                          credit_card
                        </span>
                        <span className="text-sm font-medium">Stripe</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-500">
                      {new Intl.DateTimeFormat(locale, {
                        dateStyle: "medium",
                      }).format(new Date(p.createdAt))}
                    </td>
                    <td
                      className={`px-8 py-5 text-right font-bold text-sm ${p.status === "succeeded" ? "text-teal-600" : "text-red-600"}`}
                    >
                      {p.status === "succeeded" ? "+" : "-"} {p.amount} {currency}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
