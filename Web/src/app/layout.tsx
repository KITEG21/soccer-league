import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { RootProviders } from "./providers";
import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from "@/shared/auth/session";
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
  const claims = await verifyAccessToken(
    cookieStore.get(ACCESS_TOKEN_COOKIE)?.value,
  );

  return (
    <html lang="es" suppressHydrationWarning>
      <body>
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
      </body>
    </html>
  );
}
