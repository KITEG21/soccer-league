import type { Metadata } from "next";
import { AccessDenied } from "@/shared/components/AccessDenied";
import { createPageMetadata } from "@/shared/utils/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    en: { title: "Access denied", description: "You do not have access to this section." },
    es: { title: "Acceso denegado", description: "No tienes acceso a esta sección." },
  });
}

export default function ForbiddenPage() {
  return <AccessDenied />;
}
