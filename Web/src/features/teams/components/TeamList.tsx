"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { DataTable } from "@/shared/components/DataTable";
import { RowActions } from "@/shared/components/RowActions";
import { Button } from "@/shared/components/ui/button";
import { Pagination } from "@/shared/components/ui/pagination";
import { TableCell, TableRow } from "@/shared/components/ui/table";
import type { Team } from "../types";

const COLUMNS = [
  "Equipo",
  "Provincia",
  "Mascota",
  "Jugadores",
  "Entrenadores",
  "",
];

interface TeamListProps {
  readonly teams: Team[];
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly onCreate: () => void;
  readonly onEdit: (team: Team) => void;
  readonly onDelete: (id: number) => void;
  readonly page: number;
  readonly total: number;
  readonly pageSize: number;
  readonly onPageChange: (page: number) => void;
}

export function TeamList({
  teams,
  isLoading,
  error,
  onCreate,
  onEdit,
  onDelete,
  page,
  total,
  pageSize,
  onPageChange,
}: TeamListProps) {
  return (
    <>
      <PageHeader
        title="Equipos"
        description="Administra los clubes participantes y sus plantillas"
        actions={
          <Button onClick={onCreate}>
            <Plus />
            Nuevo equipo
          </Button>
        }
      />

      <DataTable
        columns={COLUMNS}
        isLoading={isLoading}
        error={error}
        errorMessage="Error al cargar equipos"
        isEmpty={teams.length === 0}
        emptyMessage="No hay equipos registrados"
        emptyAction={
          <Button size="sm" onClick={onCreate}>
            Crear primer equipo
          </Button>
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
        {teams.map((team) => (
          <TableRow
            key={team.id}
            className="relative cursor-pointer hover:bg-accent"
          >
            <TableCell>
              <div className="flex items-center gap-3">
                <span
                  className="size-3 shrink-0 rounded-full border"
                  style={{ backgroundColor: team.color || "transparent" }}
                />
                <Link
                  href={`/teams/${team.id}`}
                  className="font-medium after:absolute after:inset-0"
                >
                  {team.name}
                </Link>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {team.province || "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {team.mascot || "—"}
            </TableCell>
            <TableCell className="tabular-nums">
              {team.players?.length ?? 0}
            </TableCell>
            <TableCell className="tabular-nums">
              {team.coaches?.length ?? 0}
            </TableCell>
            <TableCell className="relative text-right">
              <RowActions
                onEdit={() => onEdit(team)}
                onDelete={() => onDelete(team.id)}
              />
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
    </>
  );
}
