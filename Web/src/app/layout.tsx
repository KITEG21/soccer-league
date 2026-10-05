import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { RootProviders } from "./providers";
import { getServerSession } from "@/shared/auth/server-session";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Soccer League", template: "%s | Soccer League" },
  icons: { icon: "/favicon.svg" },
};

export default async function RootLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  const claims = await getServerSession();
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider>
          <RootProviders
            session={
              claims
                ? {
                    userId: claims.sub,
                    role: claims.role,
                    permissions: claims.permissions,
                  }
                : null
            }
          >
            {children}
          </RootProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
