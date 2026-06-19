import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { Loading } from "@/shared/components/Loading";
import { playersApiService } from "../services/api";
import { teamsApiService } from "../../teams/services/api";
import { Pagination } from "@/shared/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

const PAGE_SIZE = 10;

export const PlayerGlobalList = () => {
  const [page, setPage] = useState(1);

  const {
    data: playersPage,
    isLoading: isLoadingPlayers,
    error: playerError,
  } = useQuery({
    queryKey: ["players", page],
    queryFn: () => playersApiService.getPlayersPage(page, PAGE_SIZE),
  });

  const players = playersPage?.data ?? [];
  const total = playersPage?.total ?? 0;

  const {
    data: teams = [],
    isLoading: isLoadingTeams,
  } = useQuery({
    queryKey: ["teams"],
    queryFn: () => teamsApiService.getTeams(),
  });

  const isLoading = isLoadingPlayers || isLoadingTeams;
  const error = playerError;

  const playersWithTeams = players.map(player => ({
    ...player,
    team: player.team || teams.find(t => t.id === player.team_id)
  }));

  if (isLoading) return <Loading />;
  if (error) return <div className="text-destructive">Error al cargar jugadores</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="text-primary" size={24} />
          Listado Global de Jugadores
        </h2>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Equipo</TableHead>
              <TableHead>Posición</TableHead>
              <TableHead>Años en Equipo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No hay jugadores registrados.
                </TableCell>
              </TableRow>
            ) : (
              playersWithTeams.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">
                    <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded">
                      #{player.number}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell>{player.team?.name || `Equipo ${player.team_id}`}</TableCell>
                  <TableCell className="uppercase text-xs font-semibold text-primary">
                    {player.position}
                  </TableCell>
                  <TableCell>{player.years_in_team || 0}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </div>
  );
};
