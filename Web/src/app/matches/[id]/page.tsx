import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MatchDetailContainer } from "@/features/matches";
import { parseRouteId } from "@/shared/utils/route-params";

export const metadata: Metadata = { title: "Partido" };

export default async function Page({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const matchId = parseRouteId((await params).id);
  if (matchId === null) notFound();

  return <MatchDetailContainer matchId={matchId} />;
}
