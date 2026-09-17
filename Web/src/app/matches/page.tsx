import type { Metadata } from "next";
import { MatchContainer } from "@/features/matches";

export const metadata: Metadata = { title: "Partidos" };

export default function Page() {
  return <MatchContainer />;
}
