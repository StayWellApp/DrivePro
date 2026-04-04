"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Shell({
  children,
  title,
  subtitle
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const pathname = usePathname();

  const navItems = [
    { label: "Command Center", href: "/", icon: "dashboard" },
    { label: "Students", href: "/students", icon: "school" },
    { label: "Instructors", href: "/instructors", icon: "badge" },
    { label: "Fleet", href: "/fleet", icon: "directions_car" },
    { label: "Schedule", href: "/schedule", icon: "calendar_today" },
    { label: "Finances", href: "/finances", icon: "payments" },
    { label: "Lesson Review", href: "/lessons", icon: "rate_review" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname?.includes(href)) return true;
    return false;
  };

  return (
    <div className="flex min-h-screen bg-surface font-sans">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-slate-50 border-r border-slate-200/50 z-40">
        <div className="px-6 py-8">
          <h1 className="text-lg font-black tracking-tighter text-slate-900 uppercase">DrivePro</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold mt-1">Fleet Intelligence</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 transition-all duration-300 rounded-lg group ${
                  active
                    ? "text-teal-600 font-bold border-r-4 border-teal-500 bg-slate-200/50 transform translate-x-1"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/30"
                }`}
              >
                <span className={`material-symbols-outlined mr-3 text-xl ${!active && "group-hover:translate-x-1 transition-transform"}`}>
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-6 border-t border-slate-200/30 space-y-1">
          <Link href="/settings" className="flex items-center px-4 py-2 text-slate-500 hover:text-slate-900 transition-colors">
            <span className="material-symbols-outlined mr-3 text-xl">settings</span>
            <span className="text-xs font-semibold">Settings</span>
          </Link>
          <Link href="/support" className="flex items-center px-4 py-2 text-slate-500 hover:text-slate-900 transition-colors">
            <span className="material-symbols-outlined mr-3 text-xl">help</span>
            <span className="text-xs font-semibold">Support</span>
          </Link>
        <div className="p-8 bg-primary-container/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary font-bold">
              JD
            </div>
            <div>
              <p className="text-sm font-bold">John Doe</p>
              <p className="text-xs text-white/50">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="md:ml-64 min-h-screen w-full">
        {/* Top App Bar */}
        <header className="bg-white/70 backdrop-blur-xl sticky top-0 z-30 shadow-sm flex justify-between items-center px-8 py-4 w-full">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative w-full max-w-md group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-secondary transition-colors">search</span>
              <input
                className="w-full bg-surface-container-low border-none rounded-xl py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-secondary/30 transition-all outline-none placeholder:text-on-surface-variant/40"
                placeholder="Search operations..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100/50 rounded-full transition-colors relative">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-outline-variant/30">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none">Marcus Fleet</p>
                <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-tighter">Head of Operations</p>
              </div>
              <div className="h-10 w-10 rounded-xl overflow-hidden border-2 border-surface-container flex items-center justify-center font-bold text-xs bg-slate-200">
                MF
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
