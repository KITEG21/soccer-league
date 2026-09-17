import Link from "next/link";
import { Plus } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { PageHeader } from "@/shared/components/PageHeader";
import { RowActions } from "@/shared/components/RowActions";
import { Button } from "@/shared/components/ui/button";
import {
  DataTableToolbar,
  ServerDataTable,
  type dataTableFeatures,
  type FilterDefinition,
  type ListQueryState,
} from "@/shared/components/data-table";
import type { Team } from "../types";

export const TEAM_FILTERS: readonly FilterDefinition[] = [
  { key: "province", label: "Provincia", type: "text" },
  {
    key: "championships_won",
    label: "Campeonatos ganados",
    type: "number-range",
    advanced: true,
  },
  {
    key: "championships_played",
    label: "Campeonatos jugados",
    type: "number-range",
    advanced: true,
  },
];

const columnHelper = createColumnHelper<typeof dataTableFeatures, Team>();

interface TeamListProps {
  readonly teams: readonly Team[];
  readonly total: number;
  readonly query: ListQueryState;
  readonly isLoading: boolean;
  readonly isFetching: boolean;
  readonly error: Error | null;
  readonly onCreate?: () => void;
  readonly onEdit?: (team: Team) => void;
  readonly onDelete?: (id: number) => void;
}

export function TeamList({
  teams,
  total,
  query,
  isLoading,
  isFetching,
  error,
  onCreate,
  onEdit,
  onDelete,
}: TeamListProps) {
  const columns = columnHelper.columns([
    columnHelper.accessor("name", {
      header: "Equipo",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <span
            className="size-3 shrink-0 rounded-full border"
            style={{ backgroundColor: row.original.color || "transparent" }}
          />
          <Link
            href={`/teams/${row.original.id}`}
            className="font-medium after:absolute after:inset-0"
          >
            {row.original.name}
          </Link>
        </div>
      ),
    }),
    columnHelper.accessor("province", {
      header: "Provincia",
      cell: ({ getValue }) => getValue() || "—",
      meta: { cellClassName: "text-muted-foreground" },
    }),
    columnHelper.accessor("mascot", {
      header: "Mascota",
      cell: ({ getValue }) => getValue() || "—",
      meta: { cellClassName: "text-muted-foreground" },
    }),
    columnHelper.accessor("championships_won", {
      header: "Títulos",
      cell: ({ getValue }) => getValue() ?? 0,
      meta: { cellClassName: "tabular-nums" },
    }),
    columnHelper.accessor("players_count", {
      header: "Jugadores",
      cell: ({ row }) => row.original.players_count ?? row.original.players?.length ?? 0,
      meta: { cellClassName: "tabular-nums" },
    }),
    columnHelper.accessor("coaches_count", {
      header: "Entrenadores",
      cell: ({ row }) => row.original.coaches_count ?? row.original.coaches?.length ?? 0,
      meta: { cellClassName: "tabular-nums" },
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <RowActions
          onEdit={onEdit ? () => onEdit(row.original) : undefined}
          onDelete={onDelete ? () => onDelete(row.original.id) : undefined}
        />
      ),
      meta: { cellClassName: "relative text-right" },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Equipos"
        description="Administra los clubes participantes y sus plantillas"
        actions={
          onCreate && (
            <Button onClick={onCreate}>
              <Plus />
              Nuevo equipo
            </Button>
          )
        }
      />

      <DataTableToolbar
        query={query}
        searchPlaceholder="Buscar por nombre, provincia o mascota…"
      />

      <ServerDataTable
        columns={columns}
        data={teams}
        total={total}
        query={query}
        getRowId={(team) => String(team.id)}
        getRowClassName={() => "relative cursor-pointer hover:bg-accent"}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        errorMessage="Error al cargar equipos"
        emptyMessage="No hay equipos registrados"
        emptyAction={
          onCreate && (
            <Button size="sm" onClick={onCreate}>
              Crear primer equipo
            </Button>
          )
        }
      />
    </>
  );
}
