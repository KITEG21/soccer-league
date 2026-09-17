import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Plus } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { DataTable } from "@/shared/components/DataTable";
import { RowActions } from "@/shared/components/RowActions";
import { Button } from "@/shared/components/ui/button";
import { TableCell, TableRow } from "@/shared/components/ui/table";
import type { Season } from "../types";

const COLUMNS = ["Temporada", "Inicio", "Fin", ""];

const formatDate = (value?: string) => {
  if (!value) return "—";
  try {
    return format(parseISO(value), "dd/MM/yyyy");
  } catch {
    return "—";
  }
};

const getSeasonTitle = (season: Season) => {
  if (!season.start_date || !season.end_date) return `Temporada ${season.id}`;
  try {
    const start = format(parseISO(season.start_date), "MMM/yy", { locale: es });
    const end = format(parseISO(season.end_date), "MMM/yy", { locale: es });
    return `${start} - ${end}`;
  } catch {
    return `Temporada ${season.id}`;
  }
};

interface SeasonListProps {
  readonly seasons: Season[];
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly onCreate?: () => void;
  readonly onEdit?: (season: Season) => void;
  readonly onDelete?: (id: number) => void;
}

export function SeasonList({
  seasons,
  isLoading,
  error,
  onCreate,
  onEdit,
  onDelete,
}: SeasonListProps) {
  return (
    <>
      <PageHeader
        title="Temporadas"
        description="Define los periodos de competición de la liga"
        actions={
          onCreate && (
            <Button onClick={onCreate}>
              <Plus />
              Nueva temporada
            </Button>
          )
        }
      />

      <DataTable
        columns={COLUMNS}
        isLoading={isLoading}
        error={error}
        errorMessage="Error al cargar temporadas"
        isEmpty={seasons.length === 0}
        emptyMessage="No hay temporadas registradas"
        emptyAction={
          onCreate && (
            <Button size="sm" onClick={onCreate}>
              Crear primera temporada
            </Button>
          )
        }
      >
        {seasons.map((season) => (
          <TableRow key={season.id}>
            <TableCell className="font-medium capitalize">
              {getSeasonTitle(season)}
            </TableCell>
            <TableCell className="tabular-nums text-muted-foreground">
              {formatDate(season.start_date)}
            </TableCell>
            <TableCell className="tabular-nums text-muted-foreground">
              {formatDate(season.end_date)}
            </TableCell>
            <TableCell className="text-right">
              <RowActions
                onEdit={onEdit ? () => onEdit(season) : undefined}
                onDelete={onDelete ? () => onDelete(season.id) : undefined}
              />
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
    </>
  );
}
