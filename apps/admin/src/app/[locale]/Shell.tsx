import { ReactNode } from "react";
import Link from "next/link";

export default function Shell({
  children,
  title,
  subtitle
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  const navItems = [
    { label: "Dashboard", href: "/", icon: "layout-grid" },
    { label: "Fleet", href: "/fleet", icon: "car" },
    { label: "Students", href: "/students", icon: "users" },
    { label: "Finances", href: "/finances", icon: "wallet" },
  ];

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar: Intentional Asymmetry (Darker Navy) */}
      <aside className="w-72 bg-primary text-white flex flex-col fixed inset-y-0 shadow-xl">
        <div className="p-8 mb-8">
          <h1 className="text-2xl font-black tracking-tighter text-secondary">DRIVEPRO</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-4 py-3 rounded-lg hover:bg-white/10 transition-colors group"
            >
              <span className="text-sm font-medium tracking-wide">{item.label}</span>
            </Link>
          ))}
        </nav>

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

      {/* Main Content: Wide Left Margins (Editorial Feel) */}
      <main className="flex-1 ml-72 p-12 lg:p-16 max-w-7xl">
        <header className="mb-16">
          <nav className="flex items-center gap-2 text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="text-outline-variant">/</span>
            <span className="text-primary">{title}</span>
          </nav>

          <div className="flex flex-col gap-2">
            <h1 className="text-5xl font-black tracking-tight text-primary uppercase leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg text-on-surface-variant max-w-2xl font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </header>

        <section>
          {children}
        </section>
      </main>
    </div>
  );
}
