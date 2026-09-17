import type { Metadata } from "next";
import { AllStarReport } from "@/features/reports";

export const metadata: Metadata = { title: "Equipo ideal" };

export default function Page() {
  return <AllStarReport />;
}
