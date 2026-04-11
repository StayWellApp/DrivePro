"use client";

import Shell from "./Shell";
import { ObservatoryCard, DataChip } from "@repo/ui";

export default function Dashboard() {
  const fleetData = [
    { id: "VEH-001", name: "Skoda Octavia", status: "Healthy", alert: null },
    { id: "VEH-002", name: "Volkswagen Golf", status: "Maintenance Due", alert: "STK Expiry" },
    { id: "VEH-003", name: "Skoda Superb", status: "Healthy", alert: null },
    { id: "VEH-004", name: "Hyundai i30", status: "Service Required", alert: "Next Service" },
  ];

  return (
    <Shell
      title="Observatory"
      subtitle="Real-time performance analytics and fleet health monitoring."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
        <ObservatoryCard className="flex flex-col justify-between min-h-[240px]">
          <div>
            <p className="text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-2">Fleet Overview</p>
            <h3 className="text-3xl font-black text-primary mb-4">92% Operational</h3>
            <p className="text-on-surface-variant text-sm">24/26 vehicles are currently active and compliant with safety regulations.</p>
          </div>
          <div className="flex gap-2">
            <DataChip type="minor">2 Scheduled</DataChip>
            <DataChip>All Clear</DataChip>
          </div>
        </ObservatoryCard>

        <ObservatoryCard className="flex flex-col justify-between min-h-[240px] bg-kinetic text-white">
          <div className="pr-4">
            <p className="text-xs font-bold tracking-widest text-white/70 uppercase mb-2">Student Performance</p>
            <h3 className="text-3xl font-black text-secondary mb-4">4.8 Avg Rating</h3>
            <p className="text-white/80 text-sm">Consistent improvement across 15 active sessions today.</p>
          </div>
          <div className="flex gap-2">
            <DataChip type="minor">High Efficiency</DataChip>
          </div>
        </ObservatoryCard>
      </div>

      <h2 className="text-2xl font-black text-primary uppercase tracking-tight mb-8">Fleet Health Grid</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {fleetData.map((vehicle) => (
          <ObservatoryCard key={vehicle.id} className="group">
            <div className="mb-6">
              <p className="text-[10px] font-black tracking-[0.2em] text-on-surface-variant uppercase mb-1">{vehicle.id}</p>
              <h4 className="text-xl font-bold text-primary group-hover:text-secondary transition-colors">{vehicle.name}</h4>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface-variant">Status</span>
                <span className={`text-xs font-black uppercase ${vehicle.status === "Healthy" ? "text-secondary" : "text-red-500"}`}>
                  {vehicle.status}
                </span>
              </div>
              {vehicle.alert && (
                <DataChip type="major">{vehicle.alert}</DataChip>
              )}
            </div>
          </ObservatoryCard>
        ))}
      </div>
    </Shell>
  );
}
