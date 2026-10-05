import type { Metadata } from "next";
import { HeadToHeadReport } from "@/features/reports";
import { createPageMetadata } from "@/shared/utils/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    en: { title: "Head-to-head", description: "Compare results between two teams." },
    es: { title: "Cara a cara", description: "Compara los resultados entre dos equipos." },
  });
}

export default function Page() {
  return <HeadToHeadReport />;
}
