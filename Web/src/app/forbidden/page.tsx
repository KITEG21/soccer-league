import type { Metadata } from "next";
import { AccessDenied } from "@/shared/components/AccessDenied";

export const metadata: Metadata = { title: "Acceso denegado" };

export default function ForbiddenPage() {
  return <AccessDenied />;
}
