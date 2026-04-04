import React from 'react';
import { useTranslations } from 'next-intl';

export default function StudentsPage() {
  const t = useTranslations('StudentsPage');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Hero Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-secondary-container/30 text-on-secondary-container text-[10px] font-bold tracking-widest uppercase rounded-full">
              {t('directoryBadge') || 'Directory'}
            </span>
            <span className="w-1.5 h-1.5 bg-secondary-fixed-dim rounded-full"></span>
            <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">
              {t('activeFleet') || 'Active Fleet'}
            </span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tighter text-on-surface">
            {t('title')}
          </h2>
          <p className="text-on-surface-variant font-medium">
            {t('subtitle') || 'Manage and monitor progress across your driving school network.'}
          </p>
        </div>
        <button className="bg-primary-container text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-3 shadow-lg shadow-primary-container/10 hover:shadow-primary-container/20 hover:scale-[0.98] transition-all">
          <span className="material-symbols-outlined">add_circle</span>
          <span>{t('addStudent') || 'Add Student'}</span>
        </button>
      </section>

      {/* Stats Overview - Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-transparent hover:border-secondary-fixed-dim/20 transition-all group">
          <p className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest mb-2">
            {t('totalStudents') || 'Total Students'}
          </p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black tracking-tight">1,284</h3>
            <span className="text-secondary font-bold text-xs flex items-center bg-secondary-container/20 px-2 py-1 rounded-lg">
              <span className="material-symbols-outlined text-sm mr-1">trending_up</span> +12%
            </span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-transparent hover:border-secondary-fixed-dim/20 transition-all">
          <p className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest mb-2">
            {t('activeCourses') || 'Active Courses'}
          </p>
          <h3 className="text-3xl font-black tracking-tight">852</h3>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-transparent hover:border-secondary-fixed-dim/20 transition-all">
          <p className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest mb-2">
            {t('completionRate') || 'Completion Rate'}
          </p>
          <h3 className="text-3xl font-black tracking-tight">94.2%</h3>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-transparent hover:border-secondary-fixed-dim/20 transition-all">
          <p className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest mb-2">
            {t('pendingExams') || 'Pending Exams'}
          </p>
          <h3 className="text-3xl font-black tracking-tight">42</h3>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="px-8 py-6 flex justify-between items-center border-b border-surface-container-low">
          <div className="flex gap-4">
            <button className="px-4 py-1.5 bg-surface-container text-xs font-bold rounded-lg text-on-surface">
              {t('allStudents') || 'All Students'}
            </button>
            <button className="px-4 py-1.5 text-xs font-bold rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors">
              Manual B
            </button>
            <button className="px-4 py-1.5 text-xs font-bold rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors">
              Automatic B
            </button>
          </div>
          <button className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            <span className="text-xs font-bold uppercase tracking-widest">Filter</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/30">
                <th className="px-8 py-5 text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-[0.2em]">
                  {t('tableHeaderName') || 'Student Name'}
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-[0.2em]">
                  {t('tableHeaderCourse') || 'Course Type'}
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-[0.2em]">
                  {t('tableHeaderProgress') || 'Progress'}
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-[0.2em]">
                  {t('tableHeaderStatus') || 'Status'}
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-[0.2em]">
                  {t('tableHeaderActions') || 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {/* Student Row 1 */}
              <tr className="group hover:bg-surface-bright transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container">
                      <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop" alt="Alex Thompson" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">Alex Thompson</p>
                      <p className="text-xs text-on-surface-variant">ID: #DP-9283</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="px-3 py-1 bg-surface-container text-[11px] font-bold text-on-surface-variant rounded-full">Manual B</span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center relative">
                      <svg className="w-10 h-10 -rotate-90">
                        <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-200" />
                        <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={100} strokeDashoffset={25} className="text-secondary" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-on-surface">75%</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-secondary rounded-full"></span>
                    <span className="text-xs font-bold text-on-surface">{t('statusActive') || 'Active'}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </td>
              </tr>
              {/* Student Row 2 */}
              <tr className="group hover:bg-surface-bright transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container">
                      <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" alt="Sarah Jenkins" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">Sarah Jenkins</p>
                      <p className="text-xs text-on-surface-variant">ID: #DP-8472</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="px-3 py-1 bg-secondary-container/20 text-[11px] font-bold text-on-secondary-container rounded-full">Automatic B</span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center relative">
                      <svg className="w-10 h-10 -rotate-90">
                        <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-200" />
                        <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={100} strokeDashoffset={0} className="text-secondary" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-on-surface">100%</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary-container rounded-full"></span>
                    <span className="text-xs font-bold text-on-surface">{t('statusCompleted') || 'Completed'}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="px-8 py-6 bg-surface-container-low/20 flex justify-between items-center">
          <p className="text-xs font-medium text-on-surface-variant">
            {t('paginationInfo', { current: 4, total: '1,284' }) || 'Showing 4 of 1,284 students'}
          </p>
          <div className="flex gap-2">
            <button className="p-2 bg-surface-container-lowest border border-slate-100 rounded-lg text-on-surface-variant hover:text-primary hover:border-secondary transition-all">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button className="p-2 bg-primary-container text-white rounded-lg text-xs font-bold px-4">1</button>
            <button className="p-2 bg-surface-container-lowest border border-slate-100 rounded-lg text-xs font-bold px-4 text-on-surface-variant hover:border-secondary transition-all">2</button>
            <button className="p-2 bg-surface-container-lowest border border-slate-100 rounded-lg text-on-surface-variant hover:text-primary hover:border-secondary transition-all">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
