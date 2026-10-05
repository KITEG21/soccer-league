import type { Metadata } from "next";
import { CoachExperienceReport } from "@/features/reports";
import { createPageMetadata } from "@/shared/utils/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    en: { title: "Coach experience", description: "Compare coach experience and achievements." },
    es: { title: "Experiencia de entrenadores", description: "Compara la experiencia y logros de los entrenadores." },
  });
}

export default function Page() {
  return <CoachExperienceReport />;
}
