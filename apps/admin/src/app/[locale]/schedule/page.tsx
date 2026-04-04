import Shell from "../Shell";

export default function SchedulePage() {
  return (
    <Shell>
      <div className="space-y-8">
        {/* Top Header */}
        <header className="flex justify-between items-center w-full">
          <div className="flex items-center gap-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 uppercase">Master Schedule</h2>
            <div className="flex items-center gap-2 bg-surface-container rounded-full px-4 py-2">
              <span className="material-symbols-outlined text-outline">calendar_month</span>
              <span className="text-sm font-semibold">Oct 24 - Oct 30, 2023</span>
              <span className="material-symbols-outlined text-outline cursor-pointer">expand_more</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 bg-surface-container-high rounded-full p-1">
              <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-white shadow-sm text-slate-900 uppercase tracking-tighter">Day</button>
              <button className="px-4 py-1.5 rounded-full text-xs font-semibold text-on-surface-variant uppercase tracking-tighter">Week</button>
              <button className="px-4 py-1.5 rounded-full text-xs font-semibold text-on-surface-variant uppercase tracking-tighter">Month</button>
            </div>
          </div>
        </header>

        <div className="flex gap-8">
          {/* Schedule Section */}
          <div className="flex-1">
            {/* Instructor Header Row */}
            <div className="grid grid-cols-[80px_repeat(4,1fr)] border-b border-surface-container-highest pb-4 mb-2">
              <div className="text-[10px] font-bold text-outline-variant flex items-end pb-2 uppercase tracking-widest">Time</div>
              <div className="px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">MV</div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Marcus Vane</p>
                    <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">Expert Grade</p>
                  </div>
                </div>
              </div>
              <div className="px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">SC</div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Sarah Chen</p>
                    <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">Senior IV</p>
                  </div>
                </div>
              </div>
              <div className="px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">DM</div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">David Miller</p>
                    <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">Master Chief</p>
                  </div>
                </div>
              </div>
              <div className="px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">ER</div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Elena Rodriguez</p>
                    <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">Expert Grade</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Body */}
            <div className="relative bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-surface-container min-h-[600px]">
              {/* Grid Background Lines */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="grid grid-cols-[80px_repeat(4,1fr)] h-full">
                  <div className="border-r border-surface-container/50"></div>
                  <div className="border-r border-surface-container/50"></div>
                  <div className="border-r border-surface-container/50"></div>
                  <div className="border-r border-surface-container/50"></div>
                  <div></div>
                </div>
              </div>

              {/* Time Slots */}
              <div className="relative z-10">
                {/* 08:00 Slot */}
                <div className="grid grid-cols-[80px_repeat(4,1fr)] h-20 border-b border-surface-container/30">
                  <div className="flex items-center justify-center text-[11px] font-bold text-outline tracking-tighter">08:00 AM</div>
                  <div className="p-2 relative">
                    <div className="h-32 w-full absolute z-20 bg-primary-container text-white rounded-lg p-3 shadow-lg border-l-4 border-teal-500 group">
                      <div className="flex justify-between items-start">
                        <p className="text-[10px] font-bold text-teal-400 uppercase">90 min lesson</p>
                      </div>
                      <p className="font-bold text-sm mt-1">Benjamin Wright</p>
                      <p className="text-[10px] opacity-70 flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[12px]">directions_car</span>
                        Tesla Model 3 (#402)
                      </p>
                    </div>
                  </div>
                  <div className="p-2 relative">
                    <div className="h-20 w-full bg-surface-container-high rounded-lg p-3 border-l-4 border-slate-400">
                      <p className="text-[10px] font-bold text-outline uppercase">60 min lesson</p>
                      <p className="font-bold text-sm text-slate-900">Chloe Simmons</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-[80px_repeat(4,1fr)] h-20 border-b border-surface-container/30">
                  <div className="flex items-center justify-center text-[11px] font-bold text-outline tracking-tighter">09:00 AM</div>
                </div>
                <div className="grid grid-cols-[80px_repeat(4,1fr)] h-20 border-b border-surface-container/30">
                  <div className="flex items-center justify-center text-[11px] font-bold text-outline tracking-tighter">10:00 AM</div>
                </div>
              </div>
            </div>
          </div>

          {/* Unscheduled Sidebar */}
          <aside className="w-80 flex flex-col gap-6">
            <div className="bg-surface-container-low rounded-xl p-6 flex-1 flex flex-col border border-zinc-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">Unscheduled</h3>
                <span className="px-2 py-0.5 bg-white rounded text-[10px] font-bold text-teal-600 shadow-sm">12 Active</span>
              </div>
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-transparent hover:border-teal-500/30 transition-all cursor-grab group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-[10px] font-bold">AL</div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Arlo Lewis</p>
                        <p className="text-[10px] text-outline font-medium tracking-tight">Permit #9821</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-outline group-hover:text-teal-500 transition-colors">drag_indicator</span>
                  </div>
                </div>
              </div>
              <button className="mt-auto pt-6 w-full flex items-center justify-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-widest hover:text-teal-700 transition-colors">
                <span className="material-symbols-outlined text-sm">add</span>
                Manual Entry
              </button>
            </div>
          </aside>
        </div>
      </div>
    </Shell>
  );
}
