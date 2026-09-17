import type { Metadata } from "next";
import { DashboardPage } from "@/features/dashboard/containers/DashboardPage";

export const metadata: Metadata = { title: { absolute: "Resumen | Liga de Fútbol" } };

export default function Page() {
  return <DashboardPage />;
}
