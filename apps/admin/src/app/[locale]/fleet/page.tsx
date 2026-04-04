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
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Page Header & Stats Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        <div className="lg:col-span-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">{t('title')}</h2>
          <p className="text-on-surface-variant max-w-xl">
            {t('subtitle') || 'Monitor your instructional assets with real-time health telemetry and automated compliance tracking.'}
          </p>
        </div>
        <div className="lg:col-span-4 flex justify-end items-end">
          <button className="bg-primary-container text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:opacity-90 transition-all active:scale-95">
            <span className="material-symbols-outlined text-xl">add_circle</span>
            {t('registerNewVehicle') || 'Register New Vehicle'}
          </button>
        </div>
      </div>

      {/* Dashboard Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-secondary-fixed shadow-sm">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">{t('totalFleet') || 'Total Fleet'}</p>
          <h3 className="text-3xl font-black text-slate-900">{vehicles.length}</h3>
          <div className="flex items-center gap-1 text-secondary text-xs font-bold mt-2">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            +2 this month
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-amber-400 shadow-sm">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">{t('serviceDue') || 'Service Due'}</p>
          <h3 className="text-3xl font-black text-slate-900">08</h3>
          <div className="flex items-center gap-1 text-amber-600 text-xs font-bold mt-2">
            <span className="material-symbols-outlined text-sm">schedule</span>
            {t('urgentPriority') || 'Urgent priority'}
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-error shadow-sm">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">{t('alerts') || 'Alerts'}</p>
          <h3 className="text-3xl font-black text-slate-900">03</h3>
          <div className="flex items-center gap-1 text-error text-xs font-bold mt-2">
            <span className="material-symbols-outlined text-sm">report</span>
            Expired Insurance
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-slate-900 shadow-sm">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">{t('utilization') || 'Utilization'}</p>
          <h3 className="text-3xl font-black text-slate-900">94%</h3>
          <div className="flex items-center gap-1 text-slate-600 text-xs font-bold mt-2">
            <span className="material-symbols-outlined text-sm">speed</span>
            {t('peakEfficiency') || 'Peak efficiency'}
          </div>
        </div>
      </div>

      {/* Vehicle Grid & Intelligence Pane Asymmetry */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Main Vehicle Grid */}
        <div className="xl:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">{t('activeFleet') || 'Active Fleet'}</h3>
            <div className="flex gap-2">
              <span className="bg-surface-container px-3 py-1.5 rounded-lg text-xs font-bold text-on-surface-variant cursor-pointer hover:bg-slate-200 transition-colors">All</span>
              <span className="bg-white px-3 py-1.5 rounded-lg text-xs font-bold text-on-surface-variant cursor-pointer hover:bg-slate-50 transition-colors">Manual</span>
              <span className="bg-white px-3 py-1.5 rounded-lg text-xs font-bold text-on-surface-variant cursor-pointer hover:bg-slate-50 transition-colors">Automatic</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vehicles.map((vehicle) => {
              const status = getVehicleHealthStatus(vehicle);
              return (
                <div key={vehicle.id} className="group bg-surface-container-lowest rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-zinc-100">
                  <div className="relative h-48 bg-zinc-200">
                    {/* Placeholder for vehicle image */}
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      <span className="material-symbols-outlined text-5xl">directions_car</span>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter backdrop-blur
                        ${status === 'ok' ? 'bg-secondary-container/90 text-on-secondary-container' :
                          status === 'warning' ? 'bg-amber-100/90 text-amber-700' : 'bg-error/90 text-white'}`}>
                        {status.toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur text-white px-3 py-1 rounded-lg text-xs font-mono font-bold">
                      {vehicle.licensePlate}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-lg text-slate-900">{vehicle.make} {vehicle.model}</h4>
                        <p className="text-xs text-on-surface-variant">Assigned: {(vehicle as any).instructor_id || 'Unassigned'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-on-surface-variant uppercase">Mileage</p>
                        <p className="font-bold text-slate-900">{vehicle.current_mileage.toLocaleString()} km</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 rounded-lg bg-surface-container text-xs font-bold text-slate-900 hover:bg-surface-container-highest transition-colors">
                        {t('details') || 'Details'}
                      </button>
                      <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container text-slate-900 hover:bg-surface-container-highest transition-colors">
                        <span className="material-symbols-outlined text-lg">more_vert</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add Vehicle Ghost Card */}
            <div className="group border-2 border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center p-8 hover:bg-surface-container-low transition-all cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-4xl text-outline">add</span>
              </div>
              <p className="font-bold text-slate-900">{t('quickRegister') || 'Quick Register'}</p>
              <p className="text-xs text-on-surface-variant text-center">{t('quickRegisterDesc') || 'Add via VIN or Plate number'}</p>
            </div>
          </div>
        </div>

        {/* Right Pane: Document Vault & Intelligence */}
        <div className="xl:col-span-4 space-y-8">
          {/* Intelligence Card */}
          <div className="bg-primary-container rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-secondary-fixed">auto_awesome</span>
                <h4 className="text-sm font-bold uppercase tracking-widest">{t('aiIntelligence') || 'AI Intelligence'}</h4>
              </div>
              <p className="text-lg font-medium leading-tight mb-6">
                Fleet maintenance costs are projected to decrease by 12% next month after completing scheduled oil changes.
              </p>
              <button className="bg-secondary-fixed text-on-secondary-fixed px-4 py-2 rounded-lg text-xs font-black hover:opacity-90 transition-all">
                Generate Report
              </button>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-secondary-fixed/10 blur-3xl rounded-full"></div>
          </div>

          {/* Document Vault */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-zinc-100">
            <div className="p-6 pb-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">{t('documentVault') || 'Document Vault'}</h3>
              <button className="text-secondary font-bold text-xs">{t('viewAll') || 'View All'}</button>
            </div>
            <div className="px-6 pb-6 space-y-3">
              {/* Mock Documents */}
              <div className="group flex items-center gap-4 p-3 rounded-xl border border-outline-variant/30 hover:bg-slate-50 transition-all cursor-pointer">
                <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant">description</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Insurance_Policy_2024.pdf</p>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">Updated 2 days ago</p>
                </div>
                <span className="material-symbols-outlined text-outline opacity-0 group-hover:opacity-100 transition-opacity">download</span>
              </div>
              <div className="group flex items-center gap-4 p-3 rounded-xl border border-outline-variant/30 hover:bg-slate-50 transition-all cursor-pointer">
                <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant">receipt_long</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Service_Log_Toyota.jpg</p>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">Updated 1 week ago</p>
                </div>
                <span className="material-symbols-outlined text-outline opacity-0 group-hover:opacity-100 transition-opacity">visibility</span>
              </div>
            </div>
            <div className="bg-surface-container-low p-4 text-center">
              <p className="text-xs text-on-surface-variant">{t('uploadDesc') || 'Drag and drop files to upload securely'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
