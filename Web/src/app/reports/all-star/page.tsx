import type { Metadata } from "next";
import { AllStarReport } from "@/features/reports";
import { createPageMetadata } from "@/shared/utils/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    en: { title: "All-star team", description: "Discover the season's all-star team." },
    es: { title: "Equipo ideal", description: "Descubre el equipo ideal de la temporada." },
  });
}

export default function Page() {
  return <AllStarReport />;
}
