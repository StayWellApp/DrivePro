import { ReactNode } from "react";
import Link from "next/link";
import { auth } from "@/auth";

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
  const user = session?.user;

  const navItems = [
    { label: "Dashboard", href: "/", icon: "layout-grid" },
    { label: "Fleet", href: "/fleet", icon: "car" },
    { label: "Instructors", href: "/instructors", icon: "user-check" },
    { label: "Students", href: "/students", icon: "users" },
    { label: "Finances", href: "/finances", icon: "wallet" },
  ];

  const initials = user?.email?.substring(0, 2).toUpperCase() || "AD";

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-72 bg-[#0F172A] text-white flex flex-col fixed inset-y-0 shadow-xl">
        <div className="p-8 mb-8">
          <h1 className="text-2xl font-black tracking-tighter text-teal-400">
            DRIVEPRO
          </h1>
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

        <div className="p-8 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-500/30 flex items-center justify-center text-teal-400 font-bold">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">
                {user?.email || "Admin"}
              </p>
              <p className="text-xs text-white/50">Global Admin</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-12 lg:p-16 max-w-7xl">
        <header className="mb-16">
          <nav className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">
            <Link href="/" className="hover:text-slate-900 transition-colors">
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
