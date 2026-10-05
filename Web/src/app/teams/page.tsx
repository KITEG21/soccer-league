import type { Metadata } from "next";
import { TeamContainer } from "@/features/teams";
import { createPageMetadata } from "@/shared/utils/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    en: { title: "Teams", description: "Manage the clubs and squads participating in the league." },
    es: { title: "Equipos", description: "Gestiona los clubes y plantillas participantes en la liga." },
  });
}

export default function Page() {
  return <TeamContainer />;
}
