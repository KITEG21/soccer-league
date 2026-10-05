import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { RootProviders } from "./providers";
import { getServerSession } from "@/shared/auth/server-session";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");

  return {
    title: { default: t("application"), template: `%s | ${t("application")}` },
    icons: { icon: "/favicon.svg" },
  };
}

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
