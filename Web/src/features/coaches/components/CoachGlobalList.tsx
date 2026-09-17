"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { AppLink } from "@/shared/components/AppLink";
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
import { coachesApiService } from "../services/api";
import type { Coach } from "../types";

const columnHelper = createColumnHelper<typeof dataTableFeatures, Coach>();

export const CoachGlobalList = () => {
  const canEdit = usePermission("coaches:write");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const router = useRouter();
  const { options: teamOptions } = useTeamOptions();

  const filters = useMemo<readonly FilterDefinition[]>(
    () => [
      { key: "team_id", label: "Equipo", type: "select", options: teamOptions },
      { key: "experience_years", label: "Experiencia (años)", type: "number-range", advanced: true },
      { key: "championships_won", label: "Campeonatos", type: "number-range", advanced: true },
      { key: "years_in_team", label: "Años en equipo", type: "number-range", advanced: true },
    ],
    [teamOptions],
  );
  const query = useListQuery({ filters });

  const {
    data: coachesPage,
    isLoading: isLoadingCoaches,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["coaches", "list", query.apiParams],
    queryFn: () => coachesApiService.getCoachesPage(query.apiParams),
    placeholderData: keepPreviousData,
  });

  const columns = columnHelper.columns([
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
    columnHelper.accessor("experience_years", {
      header: "Experiencia",
      cell: ({ getValue }) => `${getValue() ?? 0} años`,
      meta: { cellClassName: "tabular-nums" },
    }),
    columnHelper.accessor("championships_won", {
      header: "Campeonatos",
      cell: ({ getValue }) => getValue() ?? 0,
      meta: { cellClassName: "tabular-nums" },
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
        title="Entrenadores"
        description="Listado global de entrenadores registrados en la liga"
        actions={
          canEdit && (
            <Button onClick={() => setIsPickerOpen(true)}>
              <Plus />
              Nuevo entrenador
            </Button>
          )
        }
      />

      <TeamPickerDialog
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(teamId) => router.push(`/teams/${teamId}?create=coach`)}
        title="Elige el equipo"
        description="Un entrenador pertenece a un equipo. Selecciona uno para continuar con el alta."
      />

      <DataTableToolbar query={query} searchPlaceholder="Buscar por nombre o equipo…" />

      <ServerDataTable
        columns={columns}
        data={coachesPage?.data ?? []}
        total={coachesPage?.total ?? 0}
        query={query}
        getRowId={(coach) => String(coach.id)}
        isLoading={isLoadingCoaches}
        isFetching={isFetching}
        error={error}
        errorMessage="Error al cargar entrenadores"
        emptyMessage="No hay entrenadores registrados"
      />
    </div>
  );
};
