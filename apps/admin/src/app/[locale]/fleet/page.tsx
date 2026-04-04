import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

export default async function FleetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Fleet" });

  const schoolId = 'school-456';
  const vehicles = await prisma.vehicle.findMany({
    where: { school_id: schoolId },
    orderBy: { licensePlate: 'asc' },
  });

  const getAlertStatus = (vehicle: any) => {
    const today = new Date();
    const alertThresholdDays = 30;
    const alertThresholdKm = 2000;

    const maintenanceAlert = vehicle.nextServiceDate &&
      (new Date(vehicle.nextServiceDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24) < alertThresholdDays;

    const stkAlert = vehicle.stk_expiry &&
      (new Date(vehicle.stk_expiry).getTime() - today.getTime()) / (1000 * 60 * 60 * 24) < alertThresholdDays;

    return { maintenanceAlert, stkAlert };
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

      <div className="grid gap-6">
        {vehicles.map((vehicle: any) => {
          const { maintenanceAlert, stkAlert } = getAlertStatus(vehicle);
          return (
            <div key={vehicle.id} className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">{vehicle.licensePlate}</h2>
                <p className="text-zinc-500">{vehicle.make} {vehicle.model}</p>
              </div>

              <div className="flex gap-4 mt-4 md:mt-0">
                <div className={`p-4 rounded-lg border flex flex-col items-center ${maintenanceAlert ? 'bg-amber-50 border-amber-200' : 'bg-zinc-50 border-zinc-100'}`}>
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">{t('nextService')}</span>
                  <span className={`font-bold ${maintenanceAlert ? 'text-amber-700' : 'text-zinc-700'}`}>
                    {vehicle.nextServiceDate ? new Intl.DateTimeFormat(locale).format(vehicle.nextServiceDate) : '-'}
                  </span>
                </div>

                <div className={`p-4 rounded-lg border flex flex-col items-center ${stkAlert ? 'bg-red-50 border-red-200' : 'bg-zinc-50 border-zinc-100'}`}>
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">{t('stkExpiry')}</span>
                  <span className={`font-bold ${stkAlert ? 'text-red-700' : 'text-zinc-700'}`}>
                    {vehicle.stk_expiry ? new Intl.DateTimeFormat(locale).format(vehicle.stk_expiry) : '-'}
                  </span>
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition">
                  {t('viewDocuments')}
                </button>
                <button className="px-4 py-2 border border-zinc-200 rounded-lg text-sm font-bold hover:bg-zinc-50 transition">
                  {t('edit')}
                </button>
              </div>
            </div>
          );
        })}

        {vehicles.length === 0 && (
          <p className="text-center text-zinc-500 italic p-12 bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
            {t('noVehicles')}
          </p>
        )}
      </div>
    </div>
  );
}
