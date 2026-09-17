"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/shared/components/PageHeader";
import { APP_ROUTES } from "@/shared/config/routes";
import { Loading } from "@/shared/components/Loading";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { teamsApiService } from "../services/api";
import { CoachList } from "@/features/coaches/components/CoachList";
import { PlayerList } from "@/features/players/components/PlayerList";

interface TeamDetailsPageProps {
  readonly teamId: number;
  readonly createIntent: string | null;
}

export const TeamDetailsPage = ({ teamId, createIntent }: TeamDetailsPageProps) => {
  const router = useRouter();

  const clearCreateIntent = () => {
    if (createIntent) router.replace(`/teams/${teamId}`);
  };

  const {
    data: team,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["team", teamId],
    queryFn: () => teamsApiService.getTeam(teamId),
  });

  if (isLoading) return <Loading />;

  if (error || !team) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <p className="text-destructive">Error al cargar el equipo</p>
          <Button onClick={() => router.push("/teams")}>
            Volver a equipos
          </Button>
        </CardContent>
      </Card>
    );
  }

  const details = [
    { label: "Provincia", value: team.province || "—" },
    { label: "Mascota", value: team.mascot || "—" },
    { label: "Campeonatos jugados", value: team.championships_played ?? 0 },
    { label: "Campeonatos ganados", value: team.championships_won ?? 0 },
    { label: "Jugadores", value: team.players?.length ?? 0 },
    { label: "Entrenadores", value: team.coaches?.length ?? 0 },
  ];

  return (
    <>
      <PageHeader
        title={team.name}
        description="Ficha del equipo y gestión de su plantilla"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={APP_ROUTES.matches({ team_id: team.id })}>Ver partidos</Link>
            </Button>
            <Button variant="outline" onClick={() => router.push(APP_ROUTES.teams())}>
              Volver a equipos
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
          <div
            className="size-16 shrink-0 rounded-full border-4 border-background shadow-sm ring-1 ring-border"
            style={{ backgroundColor: team.color || "var(--color-muted)" }}
          />
          <dl className="grid flex-1 grid-cols-2 gap-x-8 gap-y-3 lg:grid-cols-3">
            {details.map((detail) => (
              <div key={detail.label} className="space-y-0.5">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  {detail.label}
                </dt>
                <dd className="text-sm font-medium">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <CoachList
            teamId={teamId}
            coaches={team.coaches ?? []}
            autoCreate={createIntent === "coach"}
            onFormClose={clearCreateIntent}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <PlayerList
            teamId={teamId}
            players={team.players ?? []}
            autoCreate={createIntent === "player"}
            onFormClose={clearCreateIntent}
          />
        </CardContent>
      </Card>
    </>
  );
};
