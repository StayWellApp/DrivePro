"use client";

import Shell from "@/app/[locale]/Shell";
import Link from "next/link";

export default function SuperAdminDashboard() {
  return (
    <Shell
      title="Control Tower"
      subtitle="Global platform management and infrastructure control."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Link href="/super/schools" className="block p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
          <span className="material-symbols-outlined text-4xl mb-4 text-teal-600 group-hover:scale-110 transition-transform">
            domain
          </span>
          <h3 className="text-2xl font-black mb-2">School Management</h3>
          <p className="text-slate-500">Create schools, manage branding, and link to countries.</p>
        </Link>

        <Link href="/super/theory" className="block p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
          <span className="material-symbols-outlined text-4xl mb-4 text-teal-600 group-hover:scale-110 transition-transform">
            quiz
          </span>
          <h3 className="text-2xl font-black mb-2">Global Theory Bank</h3>
          <p className="text-slate-500">Manage theory questions across all countries and languages.</p>
        </Link>

        <div className="p-8 bg-slate-900 rounded-3xl text-white">
           <h3 className="text-xl font-bold mb-4">Platform Stats</h3>
           <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                 <span className="text-white/60">Total Schools</span>
                 <span className="font-black">12</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                 <span className="text-white/60">Active Students</span>
                 <span className="font-black">450</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-white/60">Revenue (MTD)</span>
                 <span className="font-black text-teal-400">12,400 EUR</span>
              </div>
           </div>
        </div>
      </div>
    </Shell>
  );
}
