import type { Metadata } from "next";
import { StadiumContainer } from "@/features/stadiums";

export const metadata: Metadata = { title: "Estadios" };

export default function Page() {
  return <StadiumContainer />;
}
