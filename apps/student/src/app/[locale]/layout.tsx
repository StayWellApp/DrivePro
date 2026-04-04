import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { ReactNode } from 'react';
import '../globals.css';
import Link from 'next/link';

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: 'Navigation' });

  return (
    <html lang={locale ?? 'en'} className="light">
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
    <html lang={locale ?? 'en'}>
      <body className="antialiased min-h-screen bg-zinc-950">
        <div className="fixed top-0 left-0 right-0 h-1 bg-secondary z-[2000] animate-pulse shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
        <NextIntlClientProvider messages={messages}>
          {/* SideNavBar */}
          <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-100 dark:bg-slate-900 flex flex-col h-full py-6 z-40 hidden md:flex">
            <div className="px-8 mb-10">
              <h1 className="text-lg font-black text-slate-900 dark:text-slate-50 tracking-tighter">DrivePro Flux</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mt-1">Student Portal</p>
            </div>
            <nav className="flex-1 space-y-1">
              <Link
                className="flex items-center px-8 py-4 text-teal-600 dark:text-teal-400 border-r-4 border-teal-500 bg-slate-200/50 dark:bg-slate-800/50 font-bold transition-all duration-200"
                href={`/${locale}`}
              >
                <span className="material-symbols-outlined mr-4">dashboard</span>
                <span className="text-[11px] uppercase tracking-widest">{t('dashboard')}</span>
              </Link>
              <Link
                className="flex items-center px-8 py-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/30 dark:hover:bg-slate-800/30 transition-all duration-200"
                href={`/${locale}/lessons`}
              >
                <span className="material-symbols-outlined mr-4">calendar_today</span>
                <span className="text-[11px] uppercase tracking-widest">{t('myLessons')}</span>
              </Link>
              <Link
                className="flex items-center px-8 py-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/30 dark:hover:bg-slate-800/30 transition-all duration-200"
                href={`/${locale}/theory`}
              >
                <span className="material-symbols-outlined mr-4">quiz</span>
                <span className="text-[11px] uppercase tracking-widest">{t('theoryPractice')}</span>
              </Link>
              <Link
                className="flex items-center px-8 py-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/30 dark:hover:bg-slate-800/30 transition-all duration-200"
                href={`/${locale}/finances`}
              >
                <span className="material-symbols-outlined mr-4">payments</span>
                <span className="text-[11px] uppercase tracking-widest">{t('finances')}</span>
              </Link>
              <Link
                className="flex items-center px-8 py-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/30 dark:hover:bg-slate-800/30 transition-all duration-200"
                href={`/${locale}/logbook`}
              >
                <span className="material-symbols-outlined mr-4">menu_book</span>
                <span className="text-[11px] uppercase tracking-widest">{t('skillsLogbook')}</span>
              </Link>
            </nav>
            <div className="px-6 mt-auto">
              <button className="w-full bg-primary-container text-white py-4 rounded-xl font-bold text-sm tracking-tight hover:scale-95 transition-transform duration-150">
                {t('bookLesson')}
              </button>
              <div className="mt-8 space-y-4">
                <a className="flex items-center px-2 text-slate-500 text-[11px] uppercase tracking-widest font-semibold hover:text-primary transition-colors" href="#">
                  <span className="material-symbols-outlined mr-4">contact_support</span>
                  {t('support')}
                </a>
                <a className="flex items-center px-2 text-slate-500 text-[11px] uppercase tracking-widest font-semibold hover:text-error transition-colors" href="#">
                  <span className="material-symbols-outlined mr-4">logout</span>
                  {t('signOut')}
                </a>
              </div>
            </div>
          </aside>

          <main className="flex-1 md:ml-64 relative flex flex-col">
            {/* TopNavBar */}
            <header className="bg-slate-50/70 dark:bg-slate-950/70 backdrop-blur-xl text-slate-900 dark:text-slate-50 flex justify-between items-center px-8 h-16 w-full sticky top-0 z-50">
              <div className="flex items-center gap-4">
                <span className="md:hidden material-symbols-outlined">menu</span>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{t('learningHub')}</h2>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden lg:flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/10">
                  <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2">search</span>
                  <input className="bg-transparent border-none text-sm focus:ring-0 p-0 w-48" placeholder={t('searchPlaceholder')} type="text"/>
                </div>
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">notifications</span>
                  <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">help</span>
                  <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">settings</span>
                  <div className="w-8 h-8 rounded-full bg-primary-fixed overflow-hidden border border-outline-variant">
                    <img alt="Student Profile Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWpd9_uy-MNbXO9LmG14GrjROLO_ZBjh18Pgn5wGvfiotF8mRGEYfOWrSLVPeI8J-E2f-5BaVMbZiC6Nntb_tXgMFZNcBYrwXFOcB8eSRdKHJqbyg7DM0OUCdNFRxre-siomcvU2cFYk79qQoPMy7a35lVnDhMGw59pmKBTwYjOkZXpbw3pQ66UNb152x6EijHBgAVuE2BIDSq1-IZ3CX4EYw2pwz3kkBEvU__m7GE0KRdLBu6Pbgn8nJrEgMfroi9-qvQrP7_VA"/>
                  </div>
                </div>
              </div>
            </header>

            <div className="flex-1">
              {children}
            </div>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-50/90 backdrop-blur-xl border-t border-outline-variant/20 flex justify-around items-center h-16 px-4 z-50">
              <Link className="flex flex-col items-center text-teal-600 font-bold" href={`/${locale}`}>
                <span className="material-symbols-outlined">dashboard</span>
                <span className="text-[10px]">{t('home')}</span>
              </Link>
              <Link className="flex flex-col items-center text-slate-500" href={`/${locale}/lessons`}>
                <span className="material-symbols-outlined">calendar_today</span>
                <span className="text-[10px]">{t('lessons')}</span>
              </Link>
              <Link className="flex flex-col items-center text-slate-500" href={`/${locale}/theory`}>
                <span className="material-symbols-outlined">quiz</span>
                <span className="text-[10px]">{t('theory')}</span>
              </Link>
              <Link className="flex flex-col items-center text-slate-500" href="#">
                <span className="material-symbols-outlined">person</span>
                <span className="text-[10px]">{t('profile')}</span>
              </Link>
            </nav>
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
