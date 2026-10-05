import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MatchDetailContainer } from "@/features/matches";
import { parseRouteId } from "@/shared/utils/route-params";
import { createPageMetadata } from "@/shared/utils/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    en: { title: "Match details", description: "View the match result and player statistics." },
    es: { title: "Detalle del partido", description: "Consulta el resultado y las estadísticas de jugadores." },
  });
}

export default async function Page({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const matchId = parseRouteId((await params).id);
  if (matchId === null) notFound();

  return <MatchDetailContainer matchId={matchId} />;
}
