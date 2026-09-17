"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { AppLink } from "@/shared/components/AppLink";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DataTableToolbar,
  ServerDataTable,
  useListQuery,
  type dataTableFeatures,
  type FilterDefinition,
} from "@/shared/components/data-table";
import { usePermission } from "@/shared/hooks/use-permission";
import { TeamPickerDialog } from "@/features/teams/components/TeamPickerDialog";
import { useTeamOptions } from "@/features/teams/hooks/useTeamOptions";
import { playersApiService } from "../services/api";
import { PLAYER_POSITIONS } from "../constants";
import type { Player } from "../types";

const columnHelper = createColumnHelper<typeof dataTableFeatures, Player>();

export const PlayerGlobalList = () => {
  const canEdit = usePermission("players:write");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const router = useRouter();
  const { options: teamOptions } = useTeamOptions();

  const filters = useMemo<readonly FilterDefinition[]>(
    () => [
      { key: "team_id", label: "Equipo", type: "select", options: teamOptions },
      { key: "position", label: "Posición", type: "select", options: PLAYER_POSITIONS },
      { key: "years_in_team", label: "Años en equipo", type: "number-range", advanced: true },
      { key: "number", label: "Dorsal", type: "text", placeholder: "Número exacto", advanced: true },
    ],
    [teamOptions],
  );
  const query = useListQuery({ filters });

  const {
    data: playersPage,
    isLoading: isLoadingPlayers,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["players", "list", query.apiParams],
    queryFn: () => playersApiService.getPlayersPage(query.apiParams),
    placeholderData: keepPreviousData,
  });

  const columns = columnHelper.columns([
    columnHelper.accessor("number", {
      header: "#",
      cell: ({ getValue }) => (
        <Badge variant="secondary" className="font-mono">
          {getValue() ?? "—"}
        </Badge>
      ),
    }),
    columnHelper.accessor("name", {
      header: "Nombre",
      meta: { cellClassName: "font-medium" },
    }),
    columnHelper.accessor("team_name", {
      header: "Equipo",
      cell: ({ row }) =>
        row.original.team_id ? (
          <AppLink href={`/teams/${row.original.team_id}`}>
            {row.original.team_name ?? `Equipo ${row.original.team_id}`}
          </AppLink>
        ) : (
          <span className="text-muted-foreground">Sin equipo</span>
        ),
    }),
    columnHelper.accessor("position", {
      header: "Posición",
      cell: ({ getValue }) => (
        <span className="text-xs font-semibold uppercase text-primary">{getValue()}</span>
      ),
    }),
    columnHelper.accessor("years_in_team", {
      header: "Años en equipo",
      cell: ({ getValue }) => getValue() ?? 0,
      meta: { cellClassName: "tabular-nums" },
    }),
  ]);

  return (
    <div className="space-y-6">
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

      <DataTableToolbar query={query} searchPlaceholder="Buscar por nombre, posición o equipo…" />

      <ServerDataTable
        columns={columns}
        data={playersPage?.data ?? []}
        total={playersPage?.total ?? 0}
        query={query}
        getRowId={(player) => String(player.id)}
        isLoading={isLoadingPlayers}
        isFetching={isFetching}
        error={error}
        errorMessage="Error al cargar jugadores"
        emptyMessage="No hay jugadores registrados"
      />
    </div>
  );
};
