import { ReactNode } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import StopImpersonatingButton from "./StopImpersonatingButton";
import ProfileSwitcher from "./ProfileSwitcher";
export default async function Shell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  const session = await auth();
  const locale = await getLocale();
  if (!session) redirect(`/${locale}/login`);
  const user = session?.user as any;

  let schoolBranding = { customLogoUrl: null };
  if (user?.activeSchoolId) {
    const school = await prisma.school.findUnique({
      where: { id: user.activeSchoolId }
    });
    if (school) {
      schoolBranding.customLogoUrl = school.customLogoUrl as any;
    }
  }

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { label: "Fleet", href: "/fleet", icon: "directions_car" },
    { label: "Instructors", href: "/instructors", icon: "person_check" },
    { label: "Students", href: "/students", icon: "group" },
    { label: "Finances", href: "/finances", icon: "payments" },
  ];

  if (user?.role === "SUPER_ADMIN") {
    navItems.push({ label: "Control Tower", href: "/super", icon: "security" });
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-72 bg-[#0F172A] dark text-white flex flex-col fixed inset-y-0 shadow-xl z-50">
        <div className="p-8 mb-4 flex items-center justify-between">
          {schoolBranding.customLogoUrl ? (
            <img src={schoolBranding.customLogoUrl} alt="School Logo" className="h-10 object-contain object-left" />
          ) : (
            <h1 className="text-2xl font-black tracking-tighter text-teal-400">
              DRIVEPRO
            </h1>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all group"
            >
              <span className="material-symbols-outlined text-white/40 group-hover:text-teal-400 transition-colors">
                {item.icon}
              </span>
              <span className="text-sm font-bold tracking-wide">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/10 space-y-4 bg-slate-900/50 mt-auto">
          {user?.role === "SUPER_ADMIN" && (
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
               <p className="text-[10px] font-black uppercase text-white/40 mb-2 tracking-widest">Platform Controls</p>
               <ProfileSwitcher />
            </div>
          )}

          {user?.impersonatedSchoolId && (
            <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl">
               <p className="text-[10px] font-black uppercase text-teal-400 mb-1 tracking-widest">Impersonating</p>
               <StopImpersonatingButton />
            </div>
          )}

          <div className="px-2 border-t border-white/10 pt-4">
             <Link
               href="/api/auth/force-signout"
               className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all group w-full"
             >
               <span className="material-symbols-outlined text-red-400/60 group-hover:text-red-400 transition-colors">
                 logout
               </span>
               <span className="text-sm font-bold tracking-wide">
                 Logout
               </span>
             </Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-12 lg:p-16 max-w-7xl">
        <header className="mb-16 flex justify-between items-start">
          <div>
            <nav className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">
              <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
                Home
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900">{title}</span>
            </nav>

            <div className="flex flex-col gap-2">
              <h1 className="text-5xl font-black tracking-tight text-[#0F172A] uppercase leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-lg text-slate-500 max-w-2xl font-medium">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

        </header>

        <section>{children}</section>
      </main>
    </div>
  );
}
