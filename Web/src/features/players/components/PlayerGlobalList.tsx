"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { AppLink } from "@/shared/components/AppLink";
import { DataTable } from "@/shared/components/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { Pagination } from "@/shared/components/ui/pagination";
import { TableCell, TableRow } from "@/shared/components/ui/table";
import { playersApiService } from "../services/api";
import { teamsApiService } from "@/features/teams/services/api";
import { TeamPickerDialog } from "@/features/teams/components/TeamPickerDialog";
import { Button } from "@/shared/components/ui/button";
import { usePermission } from "@/shared/hooks/use-permission";

const PAGE_SIZE = 10;
const COLUMNS = ["#", "Nombre", "Equipo", "Posición", "Años en equipo"];

export const PlayerGlobalList = () => {
  const canEdit = usePermission("players:write");
  const [page, setPage] = useState(1);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const router = useRouter();

  const {
    data: playersPage,
    isLoading: isLoadingPlayers,
    error,
  } = useQuery({
    queryKey: ["players", page],
    queryFn: () => playersApiService.getPlayersPage(page, PAGE_SIZE),
  });

  const { data: teams = [], isLoading: isLoadingTeams } = useQuery({
    queryKey: ["teams"],
    queryFn: () => teamsApiService.getTeams(),
  });

  const players = playersPage?.data ?? [];
  const total = playersPage?.total ?? 0;

  const rows = players.map((player) => ({
    ...player,
    team: player.team ?? teams.find((team) => team.id === player.team_id),
  }));

  return (
    <>
      <PageHeader
        title="Jugadores"
        description="Listado global de jugadores registrados en la liga"
        actions={
          canEdit && (
            <Button onClick={() => setIsPickerOpen(true)}>
              <Plus />
              Nuevo jugador
            </Button>
          )
        }
      />

      <TeamPickerDialog
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(teamId) => router.push(`/teams/${teamId}?create=player`)}
        title="Elige el equipo"
        description="Un jugador pertenece a un equipo. Selecciona uno para continuar con el alta."
      />

      <DataTable
        columns={COLUMNS}
        isLoading={isLoadingPlayers || isLoadingTeams}
        error={error}
        errorMessage="Error al cargar jugadores"
        isEmpty={rows.length === 0}
        emptyMessage="No hay jugadores registrados"
        footer={
          <Pagination
            page={page}
            total={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        }
      >
        {rows.map((player) => (
          <TableRow key={player.id}>
            <TableCell>
              <Badge variant="secondary" className="font-mono">
                {player.number ?? "—"}
              </Badge>
            </TableCell>
            <TableCell className="font-medium">{player.name}</TableCell>
            <TableCell>
              {player.team_id ? (
                <AppLink href={`/teams/${player.team_id}`}>
                  {player.team?.name ?? `Equipo ${player.team_id}`}
                </AppLink>
              ) : (
                <span className="text-muted-foreground">Sin equipo</span>
              )}
            </TableCell>
            <TableCell>
              <span className="text-xs font-semibold uppercase text-primary">
                {player.position}
              </span>
            </TableCell>
            <TableCell className="tabular-nums">
              {player.years_in_team ?? 0}
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
    </>
  );
};
