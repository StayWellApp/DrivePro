import { ReactNode } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import StopImpersonatingButton from "./StopImpersonatingButton";
import ProfileSwitcher from "./ProfileSwitcher";
import { UserAccountNav } from "@repo/ui";

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
    { label: "Dashboard", href: "/dashboard", icon: "layout-grid" },
    { label: "Fleet", href: "/fleet", icon: "car" },
    { label: "Instructors", href: "/instructors", icon: "user-check" },
    { label: "Students", href: "/students", icon: "users" },
    { label: "Finances", href: "/finances", icon: "wallet" },
  ];

  if (user?.role === "SUPER_ADMIN") {
    navItems.push({ label: "Control Tower", href: "/super", icon: "shield" });
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-72 bg-[#0F172A] text-white flex flex-col fixed inset-y-0 shadow-xl">
        <div className="p-8 mb-8">
          {schoolBranding.customLogoUrl ? (
            <img src={schoolBranding.customLogoUrl} alt="School Logo" className="h-10 mb-2 object-contain object-left" />
          ) : (
            <h1 className="text-2xl font-black tracking-tighter text-teal-400">
              DRIVEPRO
            </h1>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-4 py-3 rounded-lg hover:bg-white/10 transition-colors group"
            >
              <span className="text-sm font-medium tracking-wide">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="p-8 border-t border-white/10 space-y-4">
          {user?.role === "SUPER_ADMIN" && (
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
               <p className="text-[10px] font-black uppercase text-white/40 mb-2">Platform Controls</p>
               <ProfileSwitcher />
            </div>
          )}

          {user?.impersonatedSchoolId && (
            <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl">
               <p className="text-[10px] font-black uppercase text-teal-400 mb-1">Impersonating</p>
               <StopImpersonatingButton />
            </div>
          )}

          <div className="pt-2 border-t border-white/5">
             {session ? (
               <UserAccountNav user={user} />
             ) : (
               <Link
                 href="/api/auth/force-signout"
                 className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 font-bold text-xs uppercase tracking-widest"
               >
                 <span className="material-symbols-outlined text-sm">logout</span>
                 Stuck? Reset Session
               </Link>
             )}
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-12 lg:p-16 max-w-7xl">
        <header className="mb-16">
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
        </header>

        <section>{children}</section>
      </main>
    </div>
  );
}
