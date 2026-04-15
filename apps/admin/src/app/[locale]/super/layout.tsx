import { ReactNode } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UserAccountNav } from "@repo/ui";

export default async function SuperLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  const user = session?.user as any;

  // Strict Super-Admin check
  if (user?.role !== "SUPER_ADMIN") {
    redirect(`/${locale}/login`);
  }

  const superNavItems = [
    { label: "Command Center", href: `/${locale}/super`, icon: "terminal" },
    { label: "Schools Management", href: `/${locale}/super/schools`, icon: "domain" },
    { label: "Global Theory Bank", href: `/${locale}/super/theory`, icon: "menu_book" },
    { label: "System Analytics", href: `/${locale}/super/analytics`, icon: "analytics" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Super-Admin Sidebar - High Contrast */}
      <aside className="w-72 bg-slate-950 text-white flex flex-col fixed inset-y-0 shadow-2xl z-50 border-r border-white/5">
        <div className="p-8 mb-6">
          <h1 className="text-xl font-black tracking-tighter text-teal-400 flex items-center gap-2">
            <span className="material-symbols-outlined text-white">security</span>
            CONTROL TOWER
          </h1>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">Global Infrastructure</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {superNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-5 py-4 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/10"
            >
              <span className="material-symbols-outlined text-slate-500 group-hover:text-teal-400 transition-colors">
                {item.icon}
              </span>
              <span className="text-sm font-bold tracking-tight">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="p-6 space-y-4 bg-black/20 mt-auto border-t border-white/5">
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center justify-center gap-2 w-full py-4 bg-teal-500 text-slate-950 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/10"
          >
            <span className="material-symbols-outlined text-sm">exit_to_app</span>
            Exit Super-Admin
          </Link>

          <div className="pt-2">
             <UserAccountNav user={user} locale={locale} />
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-12 lg:p-16 max-w-7xl">
        {children}
      </main>
    </div>
  );
}
