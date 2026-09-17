import type { Metadata } from "next";
import { CoachExperienceReport } from "@/features/reports";

export const metadata: Metadata = { title: "Experiencia de entrenadores" };

export default function Page() {
  return <CoachExperienceReport />;
}
