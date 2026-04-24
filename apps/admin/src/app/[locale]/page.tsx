import Shell from "./Shell";
import { ObservatoryCard, DataChip } from "@repo/ui";
import Link from "next/link";

export default function Dashboard() {
  const fleetData: any[] = [];

  return (
    <Shell
      title="Observatory"
      subtitle="Real-time performance analytics and fleet health monitoring."
    >
      {/* Emergency Reset Alert */}
      <div className="mb-12 p-6 bg-red-50 border border-red-100 rounded-[30px] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
              <span className="material-symbols-outlined text-white">warning</span>
           </div>
           <div>
              <p className="font-black text-slate-900 uppercase tracking-tight">Session Conflict Detected?</p>
              <p className="text-sm text-slate-500 font-medium">If you are seeing incorrect data or are unable to log out, use the reset tool.</p>
           </div>
        </div>
        <a
          href="/api/auth/force-signout"
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
        >
          Reset Session Now
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
        <ObservatoryCard className="flex flex-col justify-between min-h-[240px]">
          <div>
            <p className="text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-2">
              Fleet Overview
            </p>
            <h3 className="text-3xl font-black text-primary mb-4">
              --
            </h3>
            <p className="text-on-surface-variant text-sm">
              Connect your fleet to see real-time operational status.
            </p>
          </div>
          <div className="flex gap-2">
            <DataChip>No Data</DataChip>
          </div>
        </ObservatoryCard>

        <ObservatoryCard className="flex flex-col justify-between min-h-[240px] bg-slate-900 text-white">
          <div className="pr-4">
            <p className="text-xs font-bold tracking-widest text-white/70 uppercase mb-2">
              Student Performance
            </p>
            <h3 className="text-3xl font-black text-white/40 mb-4">
              --
            </h3>
            <p className="text-white/60 text-sm">
              Once your first lessons are completed, performance metrics will appear here.
            </p>
          </div>
          <div className="flex gap-2">
            <DataChip type="minor">Awaiting Lessons</DataChip>
          </div>
        </ObservatoryCard>
      </div>

      <h2 className="text-2xl font-black text-primary uppercase tracking-tight mb-8">
        Fleet Health Grid
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {fleetData.length > 0 ? (fleetData as any[]).map((vehicle) => (
          <ObservatoryCard key={vehicle.id} className="group">
            <div className="mb-6">
              <p className="text-[10px] font-black tracking-[0.2em] text-on-surface-variant uppercase mb-1">
                {vehicle.id}
              </p>
              <h4 className="text-xl font-bold text-primary group-hover:text-secondary transition-colors">
                {vehicle.name}
              </h4>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface-variant">
                  Status
                </span>
                <span
                  className={`text-xs font-black uppercase ${vehicle.status === "Healthy" ? "text-secondary" : "text-red-500"}`}
                >
                  {vehicle.status}
                </span>
              </div>
              {vehicle.alert && (
                <DataChip type="major">{vehicle.alert}</DataChip>
              )}
            </div>
          </ObservatoryCard>
        )) : (
          <div className="col-span-full py-12 text-center bg-white border border-dashed border-slate-300 rounded-[30px]">
            <p className="text-slate-500 font-medium">No vehicles registered in your fleet yet.</p>
          </div>
        )}
      </div>
    </Shell>
  );
}
