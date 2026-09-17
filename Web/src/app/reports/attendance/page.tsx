import type { Metadata } from "next";
import { AttendanceReport } from "@/features/reports";

export const metadata: Metadata = { title: "Asistencia" };

export default function Page() {
  return <AttendanceReport />;
}
