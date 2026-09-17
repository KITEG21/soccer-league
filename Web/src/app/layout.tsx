import type { Metadata } from "next";
import type { ReactNode } from "react";
import { RootProviders } from "./providers";
import { getServerSession } from "@/shared/auth/server-session";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Liga de Fútbol", template: "%s | Liga de Fútbol" },
  icons: { icon: "/favicon.svg" },
};

export default async function RootLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  const claims = await getServerSession();

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
