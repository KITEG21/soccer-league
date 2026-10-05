import type { Metadata } from "next";
import { TeamStatusReport } from "@/features/reports";
import { createPageMetadata } from "@/shared/utils/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    en: { title: "Team status", description: "Review team performance for a season." },
    es: { title: "Estado del equipo", description: "Consulta el rendimiento de un equipo por temporada." },
  });
}

export default function Page() {
  return <TeamStatusReport />;
}
