import type { Metadata } from "next";
import { ScheduleReport } from "@/features/reports";
import { createPageMetadata } from "@/shared/utils/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    en: { title: "Schedule", description: "Review the league schedule and venues." },
    es: { title: "Calendario", description: "Consulta el calendario y las sedes de la liga." },
  });
}

export default function Page() {
  return <ScheduleReport />;
}
