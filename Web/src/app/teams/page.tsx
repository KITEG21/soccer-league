import type { Metadata } from "next";
import { TeamContainer } from "@/features/teams";

export const metadata: Metadata = { title: "Equipos" };

export default function Page() {
  return <TeamContainer />;
}
