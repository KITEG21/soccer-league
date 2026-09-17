import type { Metadata } from "next";
import { LoginPage } from "@/features/auth/LoginPage";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function Page() {
  return <LoginPage />;
}
