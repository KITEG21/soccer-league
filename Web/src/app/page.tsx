import type { Metadata } from "next";
import { DashboardPage } from "@/features/dashboard/containers/DashboardPage";
import { createPageMetadata } from "@/shared/utils/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    en: { title: "Dashboard", description: "Overview of your soccer league." },
    es: { title: "Resumen", description: "Vista general de tu liga de fútbol." },
  });
}

export default function Page() {
  return <DashboardPage />;
}
