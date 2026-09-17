import type { Metadata } from "next";
import { PlayerGlobalList } from "@/features/players/components/PlayerGlobalList";

export const metadata: Metadata = { title: "Jugadores" };

export default function Page() {
  return <PlayerGlobalList />;
}
