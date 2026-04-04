import Shell from "./Shell";

export default function Dashboard() {
  return (
    <Shell>
      <div className="space-y-12 font-sans">
        {/* Dashboard Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-secondary font-bold tracking-widest text-[10px] uppercase">Operational Overview</span>
            <h2 className="text-4xl font-extrabold tracking-tighter text-on-background mt-2 uppercase">Command Center</h2>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-surface-container-lowest text-on-surface font-semibold rounded-lg hover:bg-surface-bright transition-all border border-outline-variant/20 shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">download</span>
              Export Reports
            </button>
            <button className="px-6 py-3 bg-kinetic text-white font-semibold rounded-lg hover:opacity-90 transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2 uppercase tracking-tighter">
              <span className="material-symbols-outlined text-lg">add</span>
              New Lesson
            </button>
          </div>
        </section>

        {/* Summary Cards Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Students Card */}
          <div className="bg-kinetic p-6 rounded-xl relative overflow-hidden group shadow-xl">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4 text-white">
                <span className="material-symbols-outlined text-secondary text-3xl">school</span>
                <span className="text-xs font-bold text-secondary bg-secondary/10 px-2 py-1 rounded">+12%</span>
              </div>
              <p className="text-white/60 text-sm font-medium mb-1 uppercase tracking-widest text-[10px]">Active Students</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">412</h3>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-[120px] text-white">school</span>
            </div>
          </div>

          {/* Lessons Today Card */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <span className="material-symbols-outlined text-on-secondary-container">calendar_today</span>
              </div>
            </div>
            <p className="text-on-surface-variant text-sm font-medium mb-1 uppercase tracking-widest text-[10px]">Lessons Today</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-bold text-on-background tracking-tight">28</h3>
              <span className="text-on-surface-variant text-xs mb-1">/ 32 slots</span>
            </div>
            <div className="mt-4 w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
              <div className="bg-secondary h-full" style={{ width: "87%" }}></div>
            </div>
          </div>

          {/* Pending Payments Card */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-error-container rounded-lg">
                <span className="material-symbols-outlined text-on-error-container">payments</span>
              </div>
            </div>
            <p className="text-on-surface-variant text-sm font-medium mb-1 uppercase tracking-widest text-[10px]">Pending Payments</p>
            <h3 className="text-3xl font-bold text-on-background tracking-tight">4,120 CZK</h3>
            <p className="text-error text-xs font-bold mt-2 flex items-center gap-1 uppercase tracking-tighter">
              <span className="material-symbols-outlined text-sm">warning</span> 8 accounts overdue
            </p>
          </div>

          {/* Fleet Health Card */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <span className="material-symbols-outlined text-secondary">verified</span>
              </div>
            </div>
            <p className="text-on-surface-variant text-sm font-medium mb-1 uppercase tracking-widest text-[10px]">Fleet Health</p>
            <h3 className="text-3xl font-bold text-on-background tracking-tight">94%</h3>
            <div className="flex gap-1 mt-4">
              <div className="h-1 flex-1 bg-secondary rounded-full"></div>
              <div className="h-1 flex-1 bg-secondary rounded-full"></div>
              <div className="h-1 flex-1 bg-secondary rounded-full"></div>
              <div className="h-1 flex-1 bg-secondary rounded-full"></div>
              <div className="h-1 flex-1 bg-surface-container-highest rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Main Sections Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-bold tracking-tight uppercase">Today's Schedule</h4>
              <button className="text-secondary text-sm font-bold hover:underline uppercase tracking-tighter">View Full Calendar</button>
            </div>
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden divide-y divide-surface-container border border-zinc-50">
              {/* Schedule Item 1 */}
              <div className="p-5 flex items-center gap-6 hover:bg-surface-bright transition-colors">
                <div className="w-20 text-center flex flex-col">
                  <span className="text-sm font-bold text-on-background">09:00</span>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase">AM</span>
                </div>
                <div className="flex-1 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full border border-outline-variant/30 bg-surface-container flex items-center justify-center font-bold text-xs">MT</div>
                  <div>
                    <h5 className="text-sm font-bold text-on-background">Marcus Thorne</h5>
                    <p className="text-xs text-on-surface-variant font-medium">Manual Transmission • Lesson #4</p>
                  </div>
                </div>
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-bold px-2 py-1 bg-secondary/10 text-on-secondary-container rounded tracking-widest uppercase">Tesla Model 3 • DP-204</span>
                  <p className="text-[10px] text-on-surface-variant mt-1 font-bold">Instructor: Sarah J.</p>
                </div>
                <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>

              {/* Schedule Item 2 */}
              <div className="p-5 flex items-center gap-6 hover:bg-surface-bright transition-colors">
                <div className="w-20 text-center flex flex-col">
                  <span className="text-sm font-bold text-on-background">11:30</span>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase">AM</span>
                </div>
                <div className="flex-1 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full border border-outline-variant/30 bg-surface-container flex items-center justify-center font-bold text-xs">ER</div>
                  <div>
                    <h5 className="text-sm font-bold text-on-background">Elena Rodriguez</h5>
                    <p className="text-xs text-on-surface-variant font-medium">Motorway Practice • Lesson #12</p>
                  </div>
                </div>
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-bold px-2 py-1 bg-secondary/10 text-on-secondary-container rounded tracking-widest uppercase">VW Golf • DP-912</span>
                  <p className="text-[10px] text-on-surface-variant mt-1 font-bold">Instructor: David K.</p>
                </div>
                <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Faults & Insights */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold tracking-tight uppercase">Recent Faults</h4>
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/10">
              <div className="h-48 bg-slate-900 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md p-3 rounded-lg flex items-center justify-between border border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-error text-sm">warning</span>
                    <span className="text-xs font-bold text-white uppercase tracking-tighter">Engine Fault: DP-912</span>
                  </div>
                  <span className="text-[10px] font-bold text-white/60 uppercase">3 mins ago</span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-error/10 rounded">
                    <span className="material-symbols-outlined text-error text-lg">oil_barrel</span>
                  </div>
                  <div>
                    <h6 className="text-sm font-bold text-on-background">Low Oil Pressure</h6>
                    <p className="text-xs text-on-surface-variant font-medium">Vehicle DP-912 • Fleet #04</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-error/10 rounded">
                    <span className="material-symbols-outlined text-error text-lg">tire_repair</span>
                  </div>
                  <div>
                    <h6 className="text-sm font-bold text-on-background">Tire Pressure Alert</h6>
                    <p className="text-xs text-on-surface-variant font-medium">Vehicle DP-204 • Fleet #01</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Intelligence Insight Pane */}
            <div className="p-6 rounded-xl bg-kinetic text-white relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-secondary">psychology</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-secondary">AI Insight</span>
              </div>
              <p className="text-sm font-medium leading-relaxed mb-4">
                Fuel consumption is 14% higher than average this week. Recommend servicing Fleet #03 fuel injectors.
              </p>
              <button className="text-xs font-bold text-secondary hover:underline flex items-center gap-1 uppercase tracking-widest">
                Optimize Fleet Health <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <span className="material-symbols-outlined text-[80px]">auto_awesome</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}
