import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ReactNode } from "react";
import "../globals.css";
import { auth } from "@/auth";

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const session = await auth();

  console.log("DEBUG SESSION [ADMIN]:", session ? "LOGGED IN" : "NULL", session?.user?.email || "NO EMAIL");

  return (
    <html lang={locale ?? "cs"}>
      <body className="antialiased min-h-screen bg-surface">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
