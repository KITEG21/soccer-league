import type { Metadata } from "next";
import { SeasonContainer } from "@/features/seasons";
import { createPageMetadata } from "@/shared/utils/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    en: { title: "Seasons", description: "Manage the competition periods for your league." },
    es: { title: "Temporadas", description: "Gestiona los periodos de competición de tu liga." },
  });
}

export default function Page() {
  return <SeasonContainer />;
}
