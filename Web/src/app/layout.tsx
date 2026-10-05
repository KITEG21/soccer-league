import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
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
  const cookieStore = await cookies();
  const storedTheme = cookieStore.get("theme")?.value;
  const initialTheme = storedTheme === "dark" ? "dark" : "light";

  return (
    <html lang={locale} className={initialTheme} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider>
          <RootProviders
            initialTheme={initialTheme}
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
