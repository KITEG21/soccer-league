import { useQuery } from "@tanstack/react-query";
import { UserCheck } from "lucide-react";
import { Loading } from "@/shared/components/Loading";
import { coachesApiService } from "../services/api";
import { teamsApiService } from "../../teams/services/api";
import type { Coach } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

export const CoachGlobalList = () => {
  const {
    data: coaches = [],
    isLoading: isLoadingCoaches,
    error: coachError,
  } = useQuery<Coach[]>({
    queryKey: ["coaches"],
    queryFn: () => coachesApiService.getCoaches(),
  });

  const {
    data: teams = [],
    isLoading: isLoadingTeams,
  } = useQuery({
    queryKey: ["teams"],
    queryFn: () => teamsApiService.getTeams(),
  });

  const isLoading = isLoadingCoaches || isLoadingTeams;
  const error = coachError;

  const coachesWithTeams = coaches.map(coach => ({
    ...coach,
    team: coach.team || teams.find(t => t.id === coach.team_id)
  }));

  if (isLoading) return <Loading />;
  if (error) return <div className="text-destructive">Error al cargar entrenadores</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <UserCheck className="text-primary" size={24} />
          Listado Global de Entrenadores
        </h2>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Equipo</TableHead>
              <TableHead>Experiencia</TableHead>
              <TableHead>Campeonatos</TableHead>
              <TableHead>Años en Equipo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coaches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No hay entrenadores registrados.
                </TableCell>
              </TableRow>
            ) : (
              coachesWithTeams.map((coach) => (
                <TableRow key={coach.id}>
                  <TableCell className="font-medium">{coach.name}</TableCell>
                  <TableCell>{coach.team?.name || `Equipo ${coach.team_id}`}</TableCell>
                  <TableCell>{coach.experience_years} años</TableCell>
                  <TableCell>{coach.championships_won}</TableCell>
                  <TableCell>{coach.years_in_team || 0}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
