import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import { ReactNode } from 'react';
import '../globals.css';

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale ?? 'cs'}>
      <body className="antialiased min-h-screen bg-surface">
        <div className="fixed top-0 left-0 right-0 h-1 bg-secondary z-[2000] animate-pulse shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
