import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

export default async function FinancesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Finances" });

  const DEMO_STUDENT_ID = "student_1";

  let student = null;
  let payments: any[] = [];
  try {
    student = await prisma.student.findUnique({
      where: { id: DEMO_STUDENT_ID },
    });
    if (student) {
      payments = await prisma.payment.findMany({
        where: { student_id: DEMO_STUDENT_ID },
        orderBy: { createdAt: "desc" },
      });
    }
  } catch (e) {}

  const balance = student?.balance || 0;
  const lessonEstimate = Math.floor(balance / 80);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-2 block">{t("studentAccount")}</span>
          <h2 className="text-4xl font-extrabold tracking-tighter text-on-surface">{t("title")}</h2>
        </div>
        <div className="hidden lg:flex items-center gap-2 bg-secondary-container/30 text-on-secondary-container px-4 py-2 rounded-full">
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
          <span className="text-xs font-bold uppercase tracking-wider">{t("securedByStripe")}</span>
        </div>
      </div>

      {/* Dashboard Grid (Bento Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {/* Prominent Balance Card */}
        <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-primary-container to-[#1a2540] p-10 rounded-2xl flex flex-col justify-between text-white min-h-[280px]">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
              <span className="text-xs uppercase tracking-widest text-on-primary-container font-bold">{t("currentBalance")}</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-baseline md:gap-4 mt-4">
              <span className="text-7xl font-extrabold tracking-tighter">€{balance}</span>
              <span className="text-2xl font-light text-on-primary-container">/ {lessonEstimate} {t("lessons")}</span>
            </div>
          </div>
          <div className="relative z-10 flex gap-4 mt-8">
            <button className="bg-secondary text-on-secondary px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:brightness-110 transition-all shadow-lg">
              <span className="material-symbols-outlined">add_circle</span>
              {t("topUp")}
            </button>
            <button className="bg-white/10 backdrop-blur-md text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-white/20 transition-all border border-white/5">
              {t("withdraw")}
            </button>
          </div>
          {/* Decorative background element */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-secondary rounded-full opacity-10 blur-3xl"></div>
        </div>

        {/* AI Insight / Quick Tip */}
        <div className="glass-panel p-8 rounded-2xl flex flex-col justify-center border border-outline-variant/15 relative overflow-hidden bg-surface-container-lowest/50">
          <div className="mb-4">
            <div className="w-10 h-10 bg-secondary-container/30 flex items-center justify-center rounded-lg mb-4 text-on-secondary-container">
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            <h4 className="text-lg font-bold tracking-tight mb-2">{t("smartSaving")}</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {t("smartSavingDesc")}
            </p>
          </div>
          <a className="text-secondary text-xs font-bold uppercase tracking-widest flex items-center gap-2 mt-4 hover:underline" href="#">
            {t("learnMore")}
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>
      </div>

      {/* Lesson Packages */}
      <div className="mb-20">
        <div className="flex items-baseline gap-4 mb-8">
          <h3 className="text-2xl font-bold tracking-tight">{t("lessonPackages")}</h3>
          <div className="h-px flex-grow bg-outline-variant/20"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Package: Single Lesson */}
          <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/10 hover:border-secondary transition-all group flex flex-col justify-between h-full shadow-sm">
            <div>
              <span className="text-[10px] uppercase font-black text-outline tracking-[0.15em] mb-4 block">Basic</span>
              <h4 className="text-xl font-bold mb-2">Single Lesson</h4>
              <p className="text-sm text-on-surface-variant mb-6">Perfect for occasional practice or a trial session.</p>
              <div className="text-4xl font-extrabold mb-8">€80<span className="text-sm font-medium text-outline">/hr</span></div>
            </div>
            <button className="w-full py-4 rounded-xl border border-outline-variant group-hover:border-secondary group-hover:text-secondary text-sm font-extrabold uppercase tracking-widest transition-all">
              Buy Now
            </button>
          </div>
          {/* Package: 5-Lesson Bundle (Highlighted) */}
          <div className="bg-surface-container-lowest p-8 rounded-2xl border-2 border-secondary relative overflow-hidden flex flex-col justify-between h-full shadow-lg shadow-secondary/5">
            <div className="absolute top-0 right-0 bg-secondary text-on-secondary px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-bl-lg">
              Most Popular
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-secondary tracking-[0.15em] mb-4 block">Recommended</span>
              <h4 className="text-xl font-bold mb-2">5-Lesson Bundle</h4>
              <p className="text-sm text-on-surface-variant mb-6">Designed for consistent progress over a month.</p>
              <div className="text-4xl font-extrabold mb-8">€350<span className="text-sm font-medium text-outline line-through ml-2">€400</span></div>
            </div>
            <button className="w-full py-4 rounded-xl bg-secondary text-on-secondary text-sm font-extrabold uppercase tracking-widest transition-all hover:brightness-110">
              Buy Now
            </button>
          </div>
          {/* Package: Full Course */}
          <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/10 hover:border-primary transition-all group flex flex-col justify-between h-full shadow-sm">
            <div>
              <span className="text-[10px] uppercase font-black text-outline tracking-[0.15em] mb-4 block">Complete</span>
              <h4 className="text-xl font-bold mb-2">Full Course</h4>
              <p className="text-sm text-on-surface-variant mb-6">From beginner to driving test ready. Full curriculum.</p>
              <div className="text-4xl font-extrabold mb-8">€1200<span className="text-sm font-medium text-outline">/20 hrs</span></div>
            </div>
            <button className="w-full py-4 rounded-xl bg-primary-container text-white text-sm font-extrabold uppercase tracking-widest transition-all hover:opacity-90">
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold tracking-tight">{t("transactionHistory")}</h3>
          <button className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">filter_list</span>
            Filter
          </button>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em]">{t("transaction")}</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em]">{t("method")}</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em]">{t("date")}</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-right">{t("amount")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-10 text-center text-on-surface-variant italic">No transactions found</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container-low/50 transition-colors cursor-pointer">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full ${p.status === 'succeeded' ? 'bg-secondary-container/20 text-on-secondary-container' : 'bg-error-container/20 text-on-error-container'} flex items-center justify-center`}>
                          <span className="material-symbols-outlined" style={{ fontWeight: 700 }}>{p.status === 'succeeded' ? 'add' : 'remove'}</span>
                        </div>
                        <div>
                          <div className="font-bold text-sm">Credit Top-up</div>
                          <div className="text-xs text-on-surface-variant">Inv #{p.id.substring(0, 8).toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-outline text-lg">credit_card</span>
                        <span className="text-sm font-medium">Stripe (Visa •••• 4242)</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-on-surface-variant">
                      {new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(p.createdAt))}
                    </td>
                    <td className={`px-8 py-5 text-right font-bold text-sm ${p.status === 'succeeded' ? 'text-secondary' : 'text-error'}`}>
                      {p.status === 'succeeded' ? '+' : '-'} €{p.amount / 100}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="p-6 bg-surface-container-lowest flex justify-center">
            <button className="text-[10px] font-black uppercase tracking-[0.2em] text-outline hover:text-primary transition-colors">{t("loadMore")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
