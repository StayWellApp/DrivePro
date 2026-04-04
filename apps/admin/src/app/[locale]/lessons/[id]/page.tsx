import Shell from "../../Shell";

export default function LessonReviewPage() {
  return (
    <Shell>
      <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
        {/* Header Bar */}
        <header className="flex justify-between items-center w-full bg-white/70 backdrop-blur-xl p-4 rounded-xl border border-zinc-100 shadow-sm">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold tracking-tighter text-slate-900 uppercase">Session ID: #L-4829</h2>
            <p className="text-xs text-on-surface-variant font-medium tracking-wide">Student: Alex Rivers • Oct 24, 2023</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-surface-container-high px-4 py-2 rounded-full gap-2">
              <span className="material-symbols-outlined text-sm text-secondary">timer</span>
              <span className="text-sm font-bold text-slate-900">42:15 Review Duration</span>
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/10 uppercase tracking-tighter">
              <span className="material-symbols-outlined text-sm">download</span>
              Download PDF
            </button>
          </div>
        </header>

        {/* Dynamic Content Section: Interactive Review Interface */}
        <div className="flex gap-6 flex-1 overflow-hidden">
          {/* Left: Interactive Map */}
          <section className="flex-1 relative rounded-xl overflow-hidden bg-slate-900 shadow-xl group border border-zinc-100">
            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
               <span className="material-symbols-outlined text-6xl text-slate-700">map</span>
               <p className="absolute text-slate-500 font-bold uppercase tracking-widest text-xs bottom-1/2 mt-12">Interactive Map Interface</p>
            </div>

            {/* Floating Intelligence Card */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/70 backdrop-blur-xl border border-white/10 p-6 rounded-xl flex items-center justify-between shadow-2xl">
              <div className="flex items-center gap-6">
                <div className="flex flex-col text-slate-900">
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Avg Speed</span>
                  <span className="text-2xl font-black tracking-tighter">28 <span className="text-sm font-medium text-on-surface-variant">mph</span></span>
                </div>
                <div className="h-10 w-px bg-slate-300/30"></div>
                <div className="flex flex-col text-slate-900">
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">ECO Rating</span>
                  <span className="text-2xl font-black text-teal-600 tracking-tighter">84%</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-3 bg-white/80 rounded-full hover:bg-white transition-colors">
                  <span className="material-symbols-outlined text-slate-900">zoom_in</span>
                </button>
                <button className="p-3 bg-white/80 rounded-full hover:bg-white transition-colors">
                  <span className="material-symbols-outlined text-slate-900">layers</span>
                </button>
              </div>
            </div>
          </section>

          {/* Right: Video Player and Fault List */}
          <section className="w-[400px] flex flex-col gap-6 overflow-hidden">
            {/* Video Player */}
            <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden relative shadow-lg group border border-zinc-100">
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-slate-700">play_circle</span>
              </div>
              {/* Player Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                <div className="flex items-center gap-4 text-white">
                  <span className="material-symbols-outlined cursor-pointer">play_arrow</span>
                  <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-teal-500"></div>
                  </div>
                  <span className="text-xs font-mono">14:22 / 42:15</span>
                </div>
              </div>
            </div>

            {/* Timestamped Fault List */}
            <div className="flex-1 bg-surface-container-lowest rounded-xl p-6 shadow-sm overflow-y-auto border border-zinc-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-extrabold tracking-tight uppercase">Insights</h3>
                <span className="text-[10px] font-bold bg-error/10 text-error px-2 py-1 rounded">2 CRITICAL</span>
              </div>
              <div className="space-y-4">
                {/* Fault Item 1 */}
                <div className="flex gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer group border border-zinc-50">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-mono font-bold text-on-surface-variant">14:02</span>
                    <div className="w-0.5 flex-1 bg-slate-200 mt-2"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">Observation Failure</h4>
                      <span className="material-symbols-outlined text-error text-lg">warning</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">Failed to look right before committing to the merge.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Shell>
  );
}
