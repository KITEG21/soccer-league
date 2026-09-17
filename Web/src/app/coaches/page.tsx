import type { Metadata } from "next";
import { CoachGlobalList } from "@/features/coaches/components/CoachGlobalList";

export const metadata: Metadata = { title: "Entrenadores" };

export default function Page() {
  return <CoachGlobalList />;
}
