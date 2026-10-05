import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TeamDetailsPage } from "@/features/teams";
import { parseRouteId } from "@/shared/utils/route-params";
import { createPageMetadata } from "@/shared/utils/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    en: { title: "Team details", description: "View the team profile, coaches and players." },
    es: { title: "Detalle del equipo", description: "Consulta la ficha, entrenadores y jugadores del equipo." },
  });
}

export default async function Page({
  params,
  searchParams,
}: {
  readonly params: Promise<{ id: string }>;
  readonly searchParams: Promise<{ create?: string }>;
}) {
  const teamId = parseRouteId((await params).id);
  if (teamId === null) notFound();

  const { create } = await searchParams;
  return <TeamDetailsPage teamId={teamId} createIntent={create ?? null} />;
}
