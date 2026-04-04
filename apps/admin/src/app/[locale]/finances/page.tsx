import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import Shell from "../Shell";
import { ObservatoryCard, DataChip } from "@repo/ui";

export default async function FinancesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Finances" });
  const tTopUp = await getTranslations({ locale, namespace: "TopUp" });

  // Mock school ID - in real app would come from session
  const schoolId = 'school-456';

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
  });

  const totalEarnings = await prisma.payment.aggregate({
    where: {
      school_id: schoolId,
      status: 'completed',
    },
    _sum: {
      amount: true,
    },
  });

  const recentPayments = await prisma.payment.findMany({
    where: {
      school_id: schoolId,
    },
    include: {
      student: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  });

  const walletBalance = totalEarnings._sum.amount || 0;

  return (
    <Shell>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-kinetic p-8 rounded-3xl text-white min-h-[200px] flex flex-col justify-between shadow-xl">
          <div>
            <p className="text-xs font-bold tracking-widest text-white/70 uppercase mb-2">School Wallet Balance</p>
            <h3 className="text-5xl font-black text-secondary uppercase tracking-tighter">
              {walletBalance.toLocaleString()} <span className="text-2xl font-bold opacity-70">CZK</span>
            </h3>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">Real-time Sync</span>
            <span className="px-3 py-1 bg-secondary/20 rounded-full text-[10px] font-bold text-secondary uppercase tracking-widest border border-secondary/20">Stripe Active</span>
          </div>
        </div>

        <div className="bg-surface-container-low p-8 rounded-3xl min-h-[200px] flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-2">Stripe Integration</p>
            <h3 className="text-3xl font-black text-primary uppercase tracking-tighter">
              {school?.stripe_account_id ? 'Connected' : 'Pending'}
            </h3>
            <p className="text-on-surface-variant text-sm mt-2 font-medium">
              {school?.stripe_account_id
                ? 'Your account is fully synchronized with Stripe for automated top-ups.'
                : 'Complete your Stripe onboarding to start accepting student payments.'}
            </p>
          </div>
          <div className="flex gap-2">
             {school?.stripe_account_id ? (
                <span className="px-3 py-1 bg-secondary/10 rounded-full text-[10px] font-bold text-secondary uppercase tracking-widest border border-secondary/10">Verified</span>
             ) : (
                <span className="px-3 py-1 bg-error/10 rounded-full text-[10px] font-bold text-error uppercase tracking-widest border border-error/10">Action Required</span>
             )}
          </div>
        </div>
      </div>

      <div className="mb-8 flex items-baseline justify-between">
        <h2 className="text-2xl font-black text-primary uppercase tracking-tighter">Recent Transactions</h2>
        <p className="text-[10px] font-bold text-on-surface-variant tracking-[0.2em] uppercase opacity-60">Live Operational Feed</p>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="p-6 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Student</th>
                <th className="p-6 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Amount</th>
                <th className="p-6 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Date</th>
                <th className="p-6 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-right">Status</th>

  return (
    <Shell
      title={t('title')}
      subtitle="Financial health and transaction telemetry."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <ObservatoryCard className="bg-kinetic text-white min-h-[200px] flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest text-white/70 uppercase mb-2">School Wallet Balance</p>
            <h3 className="text-5xl font-black text-secondary">
              {walletBalance.toLocaleString()} <span className="text-2xl font-bold opacity-70">CZK</span>
            </h3>
          </div>
          <div className="flex gap-2">
            <DataChip>Real-time Sync</DataChip>
            <DataChip type="minor">Stripe Active</DataChip>
          </div>
        </ObservatoryCard>

        <ObservatoryCard className="bg-container-low min-h-[200px] flex flex-col justify-between border-0 shadow-none">
          <div>
            <p className="text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-2">Stripe Integration</p>
            <h3 className="text-3xl font-black text-primary uppercase">
              {school?.stripe_account_id ? 'Connected' : 'Pending'}
            </h3>
            <p className="text-on-surface-variant text-sm mt-2">
              {school?.stripe_account_id
                ? 'Your account is fully synchronized with Stripe for automated top-ups.'
                : 'Complete your Stripe onboarding to start accepting student payments.'}
            </p>
          </div>
          <div className="flex gap-2">
             {school?.stripe_account_id ? (
                <DataChip type="minor">Verified</DataChip>
             ) : (
                <DataChip type="major">Action Required</DataChip>
             )}
          </div>
        </ObservatoryCard>
      </div>

      <div className="mb-8 flex items-baseline justify-between">
        <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Recent Transactions</h2>
        <p className="text-xs font-bold text-on-surface-variant tracking-widest uppercase">Live Feed</p>
      </div>

      <div className="bg-container-lowest rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-container-low/50">
                <th className="p-6 text-xs font-black text-on-surface-variant uppercase tracking-widest">Student</th>
                <th className="p-6 text-xs font-black text-on-surface-variant uppercase tracking-widest">Amount</th>
                <th className="p-6 text-xs font-black text-on-surface-variant uppercase tracking-widest">Date</th>
                <th className="p-6 text-xs font-black text-on-surface-variant uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y-0">
              {recentPayments.map((payment: any, index: number) => (
                <tr
                  key={payment.id}
                  className={`${index % 2 === 0 ? 'bg-transparent' : 'bg-container-low/20'} hover:bg-container-low/40 transition-colors`}
                >
                  <td className="p-6">
                    <p className="font-bold text-primary">{payment.student.name}</p>
                    <p className="text-xs text-on-surface-variant font-medium opacity-70">{payment.student.email}</p>
                  </td>
                  <td className="p-6">
                    <span className="text-lg font-black text-primary">{payment.amount.toLocaleString()} CZK</span>
                  </td>
                  <td className="p-6 text-sm font-medium text-on-surface-variant">
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    }).format(payment.createdAt)}
                  </td>
                  <td className="p-6 text-right">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      payment.status === 'completed'
                        ? 'bg-secondary/10 text-secondary border-secondary/10'
                        : 'bg-error/10 text-error border-error/10'
                    }`}>
                      {payment.status}
                    </span>
                    <DataChip type={payment.status === 'completed' ? 'minor' : 'major'}>
                      {payment.status.toUpperCase()}
                    </DataChip>
                  </td>
                </tr>
              ))}
              {recentPayments.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-on-surface-variant italic font-medium">
                    No transactions recorded in the system yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
