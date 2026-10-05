import type { Metadata } from "next";
import { PlayerGlobalList } from "@/features/players/components/PlayerGlobalList";
import { createPageMetadata } from "@/shared/utils/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    en: { title: "Players", description: "Browse and manage all players in the league." },
    es: { title: "Jugadores", description: "Consulta y gestiona todos los jugadores de la liga." },
  });
}

export default function Page() {
  return <PlayerGlobalList />;
}
