import type { Metadata } from "next";
import { AttendanceReport } from "@/features/reports";
import { createPageMetadata } from "@/shared/utils/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    en: { title: "Attendance", description: "Analyze attendance across league stadiums." },
    es: { title: "Asistencia", description: "Analiza la asistencia en los estadios de la liga." },
  });
}

export default function Page() {
  return <AttendanceReport />;
}
