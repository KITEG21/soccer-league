"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { AppLink } from "@/shared/components/AppLink";
import { DataTable } from "@/shared/components/DataTable";
import { Pagination } from "@/shared/components/ui/pagination";
import { TableCell, TableRow } from "@/shared/components/ui/table";
import { coachesApiService } from "../services/api";
import { teamsApiService } from "@/features/teams/services/api";
import { TeamPickerDialog } from "@/features/teams/components/TeamPickerDialog";
import { Button } from "@/shared/components/ui/button";
import { usePermission } from "@/shared/hooks/use-permission";

const PAGE_SIZE = 10;
const COLUMNS = [
  "Nombre",
  "Equipo",
  "Experiencia",
  "Campeonatos",
  "Años en equipo",
];

export const CoachGlobalList = () => {
  const canEdit = usePermission("coaches:write");
  const [page, setPage] = useState(1);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const router = useRouter();

  const {
    data: coachesPage,
    isLoading: isLoadingCoaches,
    error,
  } = useQuery({
    queryKey: ["coaches", page],
    queryFn: () => coachesApiService.getCoachesPage(page, PAGE_SIZE),
  });

  const { data: teams = [], isLoading: isLoadingTeams } = useQuery({
    queryKey: ["teams"],
    queryFn: () => teamsApiService.getTeams(),
  });

  const coaches = coachesPage?.data ?? [];
  const total = coachesPage?.total ?? 0;

  const rows = coaches.map((coach) => ({
    ...coach,
    team: coach.team ?? teams.find((team) => team.id === coach.team_id),
  }));

  return (
    <>
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

      <DataTable
        columns={COLUMNS}
        isLoading={isLoadingCoaches || isLoadingTeams}
        error={error}
        errorMessage="Error al cargar entrenadores"
        isEmpty={rows.length === 0}
        emptyMessage="No hay entrenadores registrados"
        footer={
          <Pagination
            page={page}
            total={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        }
      >
        {rows.map((coach) => (
          <TableRow key={coach.id}>
            <TableCell className="font-medium">{coach.name}</TableCell>
            <TableCell>
              {coach.team_id ? (
                <AppLink href={`/teams/${coach.team_id}`}>
                  {coach.team?.name ?? `Equipo ${coach.team_id}`}
                </AppLink>
              ) : (
                <span className="text-muted-foreground">Sin equipo</span>
              )}
            </TableCell>
            <TableCell className="tabular-nums">
              {coach.experience_years ?? 0} años
            </TableCell>
            <TableCell className="tabular-nums">
              {coach.championships_won ?? 0}
            </TableCell>
            <TableCell className="tabular-nums">
              {coach.years_in_team ?? 0}
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
    </>
  );
};
