import type { Metadata } from "next";
import { StandingsReport } from "@/features/reports";

export const metadata: Metadata = { title: "Posiciones" };

export default function Page() {
  return <StandingsReport />;
}
