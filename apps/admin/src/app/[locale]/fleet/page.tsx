import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { getVehicleHealthStatus } from "@/lib/fleet-utils";

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

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

      <div className="grid gap-6">
        {vehicles.map((vehicle: any) => {
          const status = getVehicleHealthStatus(vehicle);
          const isWarning = status === 'warning';
          const isOverdue = status === 'overdue';

          return (
            <div
              key={vehicle.id}
              className={`bg-white rounded-xl border p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center transition-all duration-500
                ${isWarning ? 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)] bg-amber-50/30' : 'border-zinc-200'}
                ${isOverdue ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)] bg-red-50/30 animate-pulse' : ''}
              `}
            >
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-zinc-900">{vehicle.licensePlate}</h2>
                  {status !== 'ok' && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isOverdue ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'}`}>
                      {t(status === 'warning' ? 'statusWarning' : 'statusOverdue')}
                    </span>
                  )}
                </div>
                <p className="text-zinc-500">{vehicle.make} {vehicle.model}</p>
              </div>

              <div className="flex gap-4 mt-4 md:mt-0">
                <div className={`p-4 rounded-lg border flex flex-col items-center
                  ${isOverdue || (vehicle.nextServiceMileage && vehicle.nextServiceMileage - vehicle.current_mileage <= 0) ? 'bg-red-50 border-red-200' :
                    isWarning ? 'bg-amber-50 border-amber-200' : 'bg-zinc-50 border-zinc-100'}`}>
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">{t('nextService')}</span>
                  <span className={`font-bold ${isOverdue ? 'text-red-700' : isWarning ? 'text-amber-700' : 'text-zinc-700'}`}>
                    {vehicle.nextServiceDate ? new Intl.DateTimeFormat(locale).format(vehicle.nextServiceDate) : '-'}
                  </span>
                  <span className="text-[10px] text-zinc-400 mt-1 uppercase font-bold tracking-tighter">
                    {vehicle.current_mileage} / {vehicle.nextServiceMileage || '∞'} km
                  </span>
                </div>

                <div className={`p-4 rounded-lg border flex flex-col items-center ${status !== 'ok' && vehicle.stk_expiry && (new Date(vehicle.stk_expiry).getTime() - new Date().getTime()) < 0 ? 'bg-red-50 border-red-200' : 'bg-zinc-50 border-zinc-100'}`}>
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">{t('stkExpiry')}</span>
                  <span className="font-bold text-zinc-700">
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
