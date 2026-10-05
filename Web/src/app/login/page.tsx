import type { Metadata } from "next";
import { LoginPage } from "@/features/auth/LoginPage";
import { createPageMetadata } from "@/shared/utils/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    en: { title: "Sign in", description: "Sign in to manage your soccer league." },
    es: { title: "Iniciar sesión", description: "Accede para gestionar tu liga de fútbol." },
  });
}

export default function Page() {
  return <LoginPage />;
}
