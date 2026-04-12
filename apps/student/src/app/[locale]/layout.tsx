import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { ReactNode } from "react";
import "../globals.css";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import BrandingProvider from "@/components/BrandingProvider";
import { UserAccountNav } from "@repo/ui";

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "Navigation" });
  const session = await auth();

  let schoolBranding = { primaryColor: null, secondaryColor: null, customLogoUrl: null };

  if (session?.user) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { school: true }
    });
    if (user?.school) {
      schoolBranding = {
        primaryColor: user.school.primaryColor as any,
        secondaryColor: user.school.secondaryColor as any,
        customLogoUrl: user.school.customLogoUrl as any,
      };
    }
  }

  return (
    <html lang={locale ?? "en"} className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface min-h-screen flex font-['Plus_Jakarta_Sans',sans-serif]">
        <NextIntlClientProvider messages={messages}>
          <BrandingProvider primaryColor={schoolBranding.primaryColor} secondaryColor={schoolBranding.secondaryColor}>
            {/* SideNavBar */}
            <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-100 dark:bg-slate-900 flex flex-col h-full py-6 z-40 hidden md:flex">
              <div className="px-8 mb-10">
                {schoolBranding.customLogoUrl ? (
                  <img src={schoolBranding.customLogoUrl} alt="School Logo" className="h-10 mb-2 object-contain object-left" />
                ) : (
                  <h1 className="text-lg font-black text-slate-900 dark:text-slate-50 tracking-tighter">
                    DrivePro Flux
                  </h1>
                )}
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mt-1">
                  Student Portal
                </p>
              </div>
              <nav className="flex-1 space-y-1">
                <Link
                  className="flex items-center px-8 py-4 text-teal-600 dark:text-teal-400 border-r-4 border-teal-500 bg-slate-200/50 dark:bg-slate-800/50 font-bold transition-all duration-200"
                  href="/dashboard"
                >
                  <span className="material-symbols-outlined mr-4">
                    dashboard
                  </span>
                  <span className="text-[11px] uppercase tracking-widest">
                    {t("dashboard")}
                  </span>
                </Link>
                <Link
                  className="flex items-center px-8 py-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/30 dark:hover:bg-slate-800/30 transition-all duration-200"
                  href="/lessons"
                >
                  <span className="material-symbols-outlined mr-4">
                    calendar_today
                  </span>
                  <span className="text-[11px] uppercase tracking-widest">
                    {t("myLessons")}
                  </span>
                </Link>
                <Link
                  className="flex items-center px-8 py-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/30 dark:hover:bg-slate-800/30 transition-all duration-200"
                  href="/theory"
                >
                  <span className="material-symbols-outlined mr-4">quiz</span>
                  <span className="text-[11px] uppercase tracking-widest">
                    {t("theoryPractice")}
                  </span>
                </Link>
                <Link
                  className="flex items-center px-8 py-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/30 dark:hover:bg-slate-800/30 transition-all duration-200"
                  href="/finances"
                >
                  <span className="material-symbols-outlined mr-4">payments</span>
                  <span className="text-[11px] uppercase tracking-widest">
                    {t("finances")}
                  </span>
                </Link>
                <Link
                  className="flex items-center px-8 py-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/30 dark:hover:bg-slate-800/30 transition-all duration-200"
                  href="/logbook"
                >
                  <span className="material-symbols-outlined mr-4">
                    menu_book
                  </span>
                  <span className="text-[11px] uppercase tracking-widest">
                    {t("skillsLogbook")}
                  </span>
                </Link>
              </nav>
              <div className="px-6 mt-auto space-y-6">
                <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-sm tracking-tight hover:scale-95 transition-transform duration-150 shadow-lg shadow-slate-900/20">
                  {t("bookLesson")}
                </button>

                <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                   <UserAccountNav user={session?.user as any} />
                </div>
              </div>
            </aside>

            <main className="flex-1 md:ml-64 relative flex flex-col">
              {/* TopNavBar */}
              <header className="bg-slate-50/70 dark:bg-slate-950/70 backdrop-blur-xl text-slate-900 dark:text-slate-50 flex justify-between items-center px-8 h-16 w-full sticky top-0 z-50">
                <div className="flex items-center gap-4">
                  <span className="md:hidden material-symbols-outlined">
                    menu
                  </span>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {t("learningHub")}
                  </h2>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden lg:flex items-center bg-slate-200/40 dark:bg-slate-800/40 px-4 py-2 rounded-full">
                    <span className="material-symbols-outlined text-slate-500 text-sm mr-2">
                      search
                    </span>
                    <input
                      className="bg-transparent border-none text-sm focus:ring-0 p-0 w-48 outline-none"
                      placeholder={t("searchPlaceholder")}
                      type="text"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-slate-400 hover:text-teal-500 cursor-pointer transition-colors">
                      notifications
                    </span>
                    <span className="material-symbols-outlined text-slate-400 hover:text-teal-500 cursor-pointer transition-colors">
                      help
                    </span>
                    <Link href="/api/auth/force-signout" className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                       <span className="material-symbols-outlined text-sm">power_settings_new</span>
                       Force Logout
                    </Link>
                  </div>
                </div>
              </header>

              <div className="flex-1">{children}</div>

              {/* Mobile Bottom Nav */}
              <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-50/90 backdrop-blur-xl border-t border-slate-200/40 flex justify-around items-center h-16 px-4 z-50">
                <Link
                  className="flex flex-col items-center text-teal-600 font-bold"
                  href="/dashboard"
                >
                  <span className="material-symbols-outlined">dashboard</span>
                  <span className="text-[10px]">{t("home")}</span>
                </Link>
                <Link
                  className="flex flex-col items-center text-slate-500"
                  href="/lessons"
                >
                  <span className="material-symbols-outlined">
                    calendar_today
                  </span>
                  <span className="text-[10px]">{t("lessons")}</span>
                </Link>
                <Link
                  className="flex flex-col items-center text-slate-500"
                  href="/theory"
                >
                  <span className="material-symbols-outlined">quiz</span>
                  <span className="text-[10px]">{t("theory")}</span>
                </Link>
                <Link
                  className="flex flex-col items-center text-slate-500"
                  href="/finances"
                >
                  <span className="material-symbols-outlined">payments</span>
                  <span className="text-[10px]">{t("finances")}</span>
                </Link>
              </nav>
            </main>
          </BrandingProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
