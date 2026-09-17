import type { Metadata } from "next";
import { ScheduleReport } from "@/features/reports";

export const metadata: Metadata = { title: "Calendario" };

export default function Page() {
  return <ScheduleReport />;
}
