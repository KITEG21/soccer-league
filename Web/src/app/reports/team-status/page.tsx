import type { Metadata } from "next";
import { TeamStatusReport } from "@/features/reports";

export const metadata: Metadata = { title: "Estado del equipo" };

export default function Page() {
  return <TeamStatusReport />;
}
