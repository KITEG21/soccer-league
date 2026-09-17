import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TeamDetailsPage } from "@/features/teams";
import { parseRouteId } from "@/shared/utils/route-params";

export const metadata: Metadata = { title: "Equipo" };

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
