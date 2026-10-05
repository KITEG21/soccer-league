import type { Metadata } from "next";
import { MatchContainer } from "@/features/matches";
import { createPageMetadata } from "@/shared/utils/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    en: { title: "Matches", description: "Schedule, results and match statistics." },
    es: { title: "Partidos", description: "Programación, resultados y estadísticas de los partidos." },
  });
}

export default function Page() {
  return <MatchContainer />;
}
