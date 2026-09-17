import { Plus } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { DataTable } from "@/shared/components/DataTable";
import { RowActions } from "@/shared/components/RowActions";
import { Button } from "@/shared/components/ui/button";
import { Pagination } from "@/shared/components/ui/pagination";
import { TableCell, TableRow } from "@/shared/components/ui/table";
import type { Stadium } from "../types";

const COLUMNS = ["Estadio", "Capacidad", ""];

interface StadiumListProps {
  readonly stadiums: Stadium[];
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly onCreate?: () => void;
  readonly onEdit?: (stadium: Stadium) => void;
  readonly onDelete?: (id: number) => void;
  readonly page: number;
  readonly total: number;
  readonly pageSize: number;
  readonly onPageChange: (page: number) => void;
}

export function StadiumList({
  stadiums,
  isLoading,
  error,
  onCreate,
  onEdit,
  onDelete,
  page,
  total,
  pageSize,
  onPageChange,
}: StadiumListProps) {
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

      <DataTable
        columns={COLUMNS}
        isLoading={isLoading}
        error={error}
        errorMessage="Error al cargar estadios"
        isEmpty={stadiums.length === 0}
        emptyMessage="No hay estadios registrados"
        emptyAction={
          onCreate && (
            <Button size="sm" onClick={onCreate}>
              Crear primer estadio
            </Button>
          )
        }
        footer={
          <Pagination
            page={page}
            total={total}
            pageSize={pageSize}
            onPageChange={onPageChange}
          />
        }
      >
        {stadiums.map((stadium) => (
          <TableRow key={stadium.id}>
            <TableCell className="font-medium">{stadium.name}</TableCell>
            <TableCell className="tabular-nums text-muted-foreground">
              {stadium.capacity?.toLocaleString("es") ?? 0}
            </TableCell>
            <TableCell className="text-right">
              <RowActions
                onEdit={onEdit ? () => onEdit(stadium) : undefined}
                onDelete={onDelete ? () => onDelete(stadium.id) : undefined}
              />
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
    </>
  );
}
