import { Plus } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { PageHeader } from "@/shared/components/PageHeader";
import { AppLink } from "@/shared/components/AppLink";
import { APP_ROUTES } from "@/shared/config/routes";
import { RowActions } from "@/shared/components/RowActions";
import { Button } from "@/shared/components/ui/button";
import {
  DataTableToolbar,
  ServerDataTable,
  type dataTableFeatures,
  type FilterDefinition,
  type ListQueryState,
} from "@/shared/components/data-table";
import type { Stadium } from "../types";

export const STADIUM_FILTERS: readonly FilterDefinition[] = [
  { key: "capacity", label: "Capacidad", type: "number-range" },
];

const columnHelper = createColumnHelper<typeof dataTableFeatures, Stadium>();

interface StadiumListProps {
  readonly stadiums: readonly Stadium[];
  readonly total: number;
  readonly query: ListQueryState;
  readonly isLoading: boolean;
  readonly isFetching: boolean;
  readonly error: Error | null;
  readonly onCreate?: () => void;
  readonly onEdit?: (stadium: Stadium) => void;
  readonly onDelete?: (id: number) => void;
}

export function StadiumList({
  stadiums,
  total,
  query,
  isLoading,
  isFetching,
  error,
  onCreate,
  onEdit,
  onDelete,
}: StadiumListProps) {
  const columns = columnHelper.columns([
    columnHelper.accessor("name", {
      header: "Estadio",
      cell: ({ row }) => (
        <AppLink href={APP_ROUTES.matches({ stadium_id: row.original.id })}>
          {row.original.name}
        </AppLink>
      ),
      meta: { cellClassName: "font-medium" },
    }),
    columnHelper.accessor("capacity", {
      header: "Capacidad",
      cell: ({ getValue }) => getValue()?.toLocaleString("es") ?? 0,
      meta: { cellClassName: "tabular-nums text-muted-foreground" },
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
      meta: { cellClassName: "text-right" },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Estadios"
        description="Gestiona las sedes donde se disputan los partidos"
        actions={
          onCreate && (
            <Button onClick={onCreate}>
              <Plus />
              Nuevo estadio
            </Button>
          )
        }
      />

      <DataTableToolbar query={query} searchPlaceholder="Buscar estadio…" />

      <ServerDataTable
        columns={columns}
        data={stadiums}
        total={total}
        query={query}
        getRowId={(stadium) => String(stadium.id)}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        errorMessage="Error al cargar estadios"
        emptyMessage="No hay estadios registrados"
        emptyAction={
          onCreate && (
            <Button size="sm" onClick={onCreate}>
              Crear primer estadio
            </Button>
          )
        }
      />
    </>
  );
}
