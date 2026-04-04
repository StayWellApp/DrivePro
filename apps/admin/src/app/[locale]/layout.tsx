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
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-surface font-body">
        <div className="fixed top-0 left-0 right-0 h-1 bg-secondary z-[2000] animate-pulse shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
