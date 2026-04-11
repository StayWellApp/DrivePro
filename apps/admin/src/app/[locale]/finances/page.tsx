import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

export default async function FinancesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Finances" });

  // Mock school ID
  const schoolId = "school-456";
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
  });

  const totalEarnings = await prisma.payment.aggregate({
    where: {
      school_id: schoolId,
      status: "completed",
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
      createdAt: "desc",
    },
    take: 10,
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-white rounded-lg border shadow-sm">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
            {t("totalEarnings")}
          </h2>
          <p className="text-3xl font-bold text-green-600">
            {totalEarnings._sum.amount?.toLocaleString() || 0} CZK
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg border shadow-sm">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
            {t("stripeStatus")}
          </h2>
          <p
            className={`text-xl font-semibold ${school?.stripe_account_id ? "text-blue-600" : "text-amber-600"}`}
          >
            {school?.stripe_account_id ? t("connected") : t("pending")}
          </p>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">{t("recentPayments")}</h2>
        <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-sm font-medium text-gray-500">
                  {t("student")}
                </th>
                <th className="p-4 text-sm font-medium text-gray-500">
                  {t("amount")}
                </th>
                <th className="p-4 text-sm font-medium text-gray-500">
                  {t("date")}
                </th>
                <th className="p-4 text-sm font-medium text-gray-500">
                  {t("status")}
                </th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((payment: any) => (
                <tr
                  key={payment.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="p-4">{payment.student.name}</td>
                  <td className="p-4 font-medium">
                    {payment.amount.toLocaleString()} CZK
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: "medium",
                    }).format(payment.createdAt)}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentPayments.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-gray-500 italic"
                  >
                    {t("noPayments")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
