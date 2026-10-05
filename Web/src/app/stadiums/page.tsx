import type { Metadata } from "next";
import { StadiumContainer } from "@/features/stadiums";
import { createPageMetadata } from "@/shared/utils/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    en: { title: "Stadiums", description: "Manage the stadiums and venues used by the league." },
    es: { title: "Estadios", description: "Gestiona los estadios y sedes de la liga." },
  });
}

export default function Page() {
  return <StadiumContainer />;
}
