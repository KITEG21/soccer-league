import type { Metadata } from "next";
import { StandingsReport } from "@/features/reports";
import { createPageMetadata } from "@/shared/utils/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    en: { title: "Standings", description: "Review the current league standings." },
    es: { title: "Posiciones", description: "Consulta la tabla de posiciones actual de la liga." },
  });
}

export default function Page() {
  return <StandingsReport />;
}
