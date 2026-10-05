import type { Metadata } from "next";
import { CoachGlobalList } from "@/features/coaches/components/CoachGlobalList";
import { createPageMetadata } from "@/shared/utils/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    en: { title: "Coaches", description: "Manage the coaches registered in the league." },
    es: { title: "Entrenadores", description: "Gestiona los entrenadores registrados en la liga." },
  });
}

export default function Page() {
  return <CoachGlobalList />;
}
