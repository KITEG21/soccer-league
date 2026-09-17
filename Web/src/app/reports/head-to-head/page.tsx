import type { Metadata } from "next";
import { HeadToHeadReport } from "@/features/reports";

export const metadata: Metadata = { title: "Cara a cara" };

export default function Page() {
  return <HeadToHeadReport />;
}
