import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { RootProviders } from "./providers";
import { SESSION_COOKIE, verifySessionToken } from "@/shared/auth/session";
import "./globals.css";

export const metadata: Metadata = {
  title: "Liga de Fútbol",
  icons: { icon: "/favicon.svg" },
};

export default async function RootLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  const cookieStore = await cookies();
  const isAuthenticated = await verifySessionToken(
    cookieStore.get(SESSION_COOKIE)?.value,
  );

  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <RootProviders isAuthenticated={isAuthenticated}>
          {children}
        </RootProviders>
      </body>
    </html>
  );
}
