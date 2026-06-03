import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { teamsApiService } from "../../teams/services/api";
import { Button } from "@/shared/components/ui/button";
import { Loading } from "@/shared/components/Loading";
import { CoachList } from "../../coaches/components/CoachList";
import { PlayerList } from "../../players/components/PlayerList";
import { BreadcrumbNav } from "@/shared/components/BreadcrumbNav";

export const TeamDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const teamId = Number(id);

  const {
    data: team,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["team", teamId],
    queryFn: () => teamsApiService.getTeam(teamId),
    enabled: !isNaN(teamId),
  });

  if (isLoading) return <Loading />;
  if (error || !team)
    return (
      <div className="container py-8 text-center">
        <p className="text-destructive mb-4">Error al cargar el equipo</p>
        <Button onClick={() => navigate("/teams")}>Volver a equipos</Button>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <BreadcrumbNav
        items={[{ label: "Equipos", to: "/teams" }, { label: team.name }]}
      />

      <h1 className="text-3xl font-bold">Detalles del Equipo</h1>

      <div className="bg-card rounded-xl border shadow-sm p-6 overflow-hidden relative">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex bg-border items-center justify-center rounded-full w-22 h-22">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: team.color || "#ccc" }}
            >
              <Trophy size={42} className="absolute text-border" />
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <h2 className="text-2xl font-bold">{team.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">
                  Provincia:
                </span>{" "}
                {team.province || "No definida"}
              </p>
              <p>
                <span className="font-semibold text-foreground">Mascota:</span>{" "}
                {team.mascot || "No definida"}
              </p>
              <p>
                <span className="font-semibold text-foreground">Color:</span>{" "}
                {team.color || "No definido"}
              </p>
              <p>
                <span className="font-semibold text-foreground">
                  Campeonatos jugados:
                </span>{" "}
                {team.championships_played || 0}
              </p>
              <p>
                <span className="font-semibold text-foreground">
                  Campeonatos ganados:
                </span>{" "}
                {team.championships_won || 0}
              </p>
              <p>
                <span className="font-semibold text-foreground">
                  Jugadores:
                </span>{" "}
                {team.players?.length ?? 0}
              </p>
              <p>
                <span className="font-semibold text-foreground">
                  Entrenadores:
                </span>{" "}
                {team.coaches?.length ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm p-6">
        <CoachList teamId={teamId} coaches={team.coaches ?? []} />
      </div>

      <div className="bg-card rounded-xl border shadow-sm p-6">
        <PlayerList teamId={teamId} players={team.players ?? []} />
      </div>
    </div>
  );
};
