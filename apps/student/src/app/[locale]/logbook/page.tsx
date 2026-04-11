import { getTranslations } from "next-intl/server";

export default async function LogbookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Logbook" });

  return (
    <section className="p-8 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2 block">
            {t("studentProgress")}
          </span>
          <h2 className="text-5xl font-extrabold tracking-tighter text-primary-container">
            {t("title")}
          </h2>
        </div>
        <div className="flex gap-4">
          <div className="glass-panel p-4 rounded-xl border border-white/20 shadow-sm flex items-center gap-4 bg-surface-container-lowest/50 backdrop-blur-md">
            <div className="w-12 h-12 rounded-full bg-secondary-container/30 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-on-secondary-container"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                analytics
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-container tracking-tight">
                68%
              </p>
              <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">
                {t("masteryLevel")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Category 1: Basic Control */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-8 shadow-[0_4px_24px_-10px_rgba(15,23,42,0.05)] border border-outline-variant/10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-600">
                  settings_input_component
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-primary-container">
                Basic Control
              </h3>
            </div>
            <span className="text-xs font-bold text-on-secondary-container bg-secondary-container/30 px-3 py-1 rounded-full uppercase tracking-widest">
              4 / 4 Complete
            </span>
          </div>
          <div className="space-y-6">
            {/* Skill Item */}
            <div className="group flex items-start justify-between p-4 rounded-xl hover:bg-surface-container-low transition-all duration-300">
              <div className="flex gap-5 flex-1">
                <div className="mt-1 flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-on-secondary">
                  <span className="material-symbols-outlined text-base">
                    check
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-on-surface mb-1">Steering</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    "Great hand-over-hand technique. Positioning is consistent
                    on straights."
                  </p>
                  <span className="text-[10px] text-on-secondary-container/70 font-bold uppercase tracking-tighter mt-2 block">
                    Instructor: Mark Thompson
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase text-secondary tracking-widest">
                {t("mastered")}
              </span>
            </div>
            {/* Skill Item */}
            <div className="group flex items-start justify-between p-4 rounded-xl hover:bg-surface-container-low transition-all duration-300">
              <div className="flex gap-5 flex-1">
                <div className="mt-1 flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-on-secondary">
                  <span className="material-symbols-outlined text-base">
                    check
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-on-surface mb-1">Braking</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    "Smooth deceleration. Good understanding of stopping
                    distances."
                  </p>
                  <span className="text-[10px] text-on-secondary-container/70 font-bold uppercase tracking-tighter mt-2 block">
                    Instructor: Mark Thompson
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase text-secondary tracking-widest">
                {t("mastered")}
              </span>
            </div>
            <div className="h-px bg-slate-100 mx-4"></div>
            {/* Skill Item */}
            <div className="group flex items-start justify-between p-4 rounded-xl hover:bg-surface-container-low transition-all duration-300">
              <div className="flex gap-5 flex-1">
                <div className="mt-1 flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-on-secondary">
                  <span className="material-symbols-outlined text-base">
                    check
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-on-surface mb-1">
                    Moving Off & Stopping
                  </h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    "Excellent blind spot checks before pulling away."
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase text-secondary tracking-widest">
                {t("mastered")}
              </span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Stats & Highlights */}
        <div className="lg:col-span-4 space-y-8">
          {/* Intelligence Pane */}
          <div className="glass-panel p-8 rounded-xl border border-white/40 shadow-xl relative overflow-hidden bg-surface-container-lowest/50">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary-container/20 blur-3xl rounded-full"></div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary-container mb-6 flex items-center gap-2">
              <span
                className="material-symbols-outlined text-secondary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
              {t("intelligence")}
            </h4>
            <p className="text-sm leading-relaxed text-on-surface mb-6">
              You're progressing 15% faster than average in technical
              manoeuvres. Focus on high-traffic roundabouts next.
            </p>
            <button className="w-full py-3 bg-primary-container text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:opacity-90 transition-opacity">
              {t("recommendedDrill")}
            </button>
          </div>

          <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
            <h4 className="text-sm font-black uppercase tracking-widest mb-6 text-on-surface-variant">
              {t("upcomingFocus")}
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/10">
                <span className="material-symbols-outlined text-primary">
                  navigation
                </span>
                <span className="text-sm font-bold">Complex Intersections</span>
              </div>
              <div className="flex items-center gap-4 p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/10">
                <span className="material-symbols-outlined text-primary">
                  speed
                </span>
                <span className="text-sm font-bold">
                  Dual Carriageway Merge
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Category 2: Traffic Situations */}
        <div className="lg:col-span-12 bg-surface-container-lowest rounded-xl p-8 shadow-[0_4px_24px_-10px_rgba(15,23,42,0.05)] border border-outline-variant/10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-600">
                  traffic
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-primary-container">
                Traffic Situations
              </h3>
            </div>
            <span className="text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full uppercase tracking-widest">
              2 / 5 Complete
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {/* Skill Item */}
            <div className="flex items-start justify-between p-4 rounded-xl border border-slate-50 hover:bg-surface-container-low transition-all">
              <div className="flex gap-4 flex-1">
                <div className="mt-1 flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white">
                  <span className="material-symbols-outlined text-base">
                    hourglass_empty
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-on-surface">Roundabouts</h4>
                  <p className="text-xs text-on-surface-variant mt-1 italic">
                    "Struggling with lane choice at larger exits. Needs more
                    practice."
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase text-orange-600 tracking-widest pt-1">
                {t("inProgress")}
              </span>
            </div>
            {/* Skill Item */}
            <div className="flex items-start justify-between p-4 rounded-xl border border-slate-50 hover:bg-surface-container-low transition-all">
              <div className="flex gap-4 flex-1">
                <div className="mt-1 flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-white">
                  <span className="material-symbols-outlined text-base">
                    check
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-on-surface">Intersections</h4>
                  <p className="text-xs text-on-surface-variant mt-1 italic">
                    "Observational checks are excellent."
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase text-secondary tracking-widest pt-1">
                {t("mastered")}
              </span>
            </div>
          </div>
        </div>

        {/* Category 3: Manoeuvres */}
        <div className="lg:col-span-12 bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-600">
                  directions_car
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-primary-container">
                Manoeuvres
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Skill Card */}
            <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group shadow-sm">
              <div className="absolute top-0 right-0 p-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-orange-600 text-sm">
                    history
                  </span>
                </div>
              </div>
              <h4 className="font-bold mb-2">Parallel Parking</h4>
              <div className="h-1.5 w-full bg-slate-100 rounded-full mb-4">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: "45%" }}
                ></div>
              </div>
              <p className="text-[11px] text-on-surface-variant mb-4 font-medium italic leading-relaxed">
                "Getting closer to the curb now. Just need to work on steering
                timing."
              </p>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-orange-600">
                  {t("inProgress")}
                </span>
                <span className="text-[9px] font-bold text-slate-400">
                  Last updated: 2 days ago
                </span>
              </div>
            </div>
            {/* Skill Card */}
            <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group shadow-sm">
              <div className="absolute top-0 right-0 p-4">
                <div className="w-8 h-8 bg-secondary-container/50 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-sm">
                    verified
                  </span>
                </div>
              </div>
              <h4 className="font-bold mb-2">Emergency Stop</h4>
              <div className="h-1.5 w-full bg-slate-100 rounded-full mb-4">
                <div
                  className="h-full bg-secondary rounded-full"
                  style={{ width: "100%" }}
                ></div>
              </div>
              <p className="text-[11px] text-on-surface-variant mb-4 font-medium italic leading-relaxed">
                "Reaction time is within test standards. Controlled and safe."
              </p>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-secondary">
                  {t("mastered")}
                </span>
                <span className="text-[9px] font-bold text-slate-400">
                  Last updated: 1 week ago
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 right-8 z-50">
        <button className="flex items-center gap-3 px-6 py-4 bg-primary-container text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-150">
          <span className="material-symbols-outlined">print</span>
          <span className="text-xs font-black uppercase tracking-widest">
            {t("downloadPdf")}
          </span>
        </button>
      </div>
    </section>
  );
}
