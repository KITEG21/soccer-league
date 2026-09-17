import type { Metadata } from "next";
import { SeasonContainer } from "@/features/seasons";

export const metadata: Metadata = { title: "Temporadas" };

export default function Page() {
  return <SeasonContainer />;
}
