"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { AppLink } from "@/shared/components/AppLink";
import { Field } from "@/shared/components/Field";
import { DataTable } from "@/shared/components/DataTable";
import { RowActions } from "@/shared/components/RowActions";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Pagination } from "@/shared/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { TableCell, TableRow } from "@/shared/components/ui/table";
import type { Season } from "@/features/seasons/types";
import { getSeasonLabel } from "@/features/seasons/utils";
import type { Match } from "../types";

const COLUMNS = ["Fecha", "Local", "Resultado", "Visitante", "Estadio", ""];

interface MatchListProps {
  readonly matches: Match[];
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly onCreate: () => void;
  readonly onEdit: (match: Match) => void;
  readonly onDelete: (id: number) => void;
  readonly page: number;
  readonly total: number;
  readonly pageSize: number;
  readonly onPageChange: (page: number) => void;
  readonly seasons: Season[];
  readonly selectedSeason: string;
  readonly onSeasonChange: (season: string) => void;
}

export function MatchList({
  matches,
  isLoading,
  error,
  onCreate,
  onEdit,
  onDelete,
  page,
  total,
  pageSize,
  onPageChange,
  seasons,
  selectedSeason,
  onSeasonChange,
}: MatchListProps) {

  return (
    <>
      <PageHeader
        title="Partidos"
        description="Programación, resultados y estadísticas de cada encuentro"
        actions={
          <>
            <Field label="Temporada">
              <Select
                value={selectedSeason || "all"}
                onValueChange={(value) =>
                  onSeasonChange(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Todas las temporadas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las temporadas</SelectItem>
                  {seasons.map((season) => (
                    <SelectItem key={season.id} value={season.id.toString()}>
                      {getSeasonLabel(season)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Button onClick={onCreate}>
              <Plus />
              Nuevo partido
            </Button>
          </>
        }
      />

      <DataTable
        columns={COLUMNS}
        isLoading={isLoading}
        error={error}
        errorMessage="Error al cargar partidos"
        isEmpty={matches.length === 0}
        emptyMessage="No hay partidos registrados"
        emptyAction={
          <Button size="sm" onClick={onCreate}>
            Crear primer partido
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
        {matches.map((match) => (
          <TableRow
            key={match.id}
            className="relative cursor-pointer hover:bg-accent"
          >
            <TableCell className="whitespace-nowrap tabular-nums text-muted-foreground">
              <Link
                href={`/matches/${match.id}`}
                className="after:absolute after:inset-0"
              >
                {format(new Date(match.match_date), "dd/MM/yyyy HH:mm", {
                  locale: es,
                })}
              </Link>
            </TableCell>
            <TableCell className="font-medium">
              <AppLink href={`/teams/${match.home_team_id}`}>
                {match.home_team?.name || `Equipo ${match.home_team_id}`}
              </AppLink>
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="font-mono tabular-nums">
                {match.home_goals} - {match.away_goals}
              </Badge>
            </TableCell>
            <TableCell className="font-medium">
              <AppLink href={`/teams/${match.away_team_id}`}>
                {match.away_team?.name || `Equipo ${match.away_team_id}`}
              </AppLink>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {match.stadium?.name || `Estadio ${match.stadium_id}`}
            </TableCell>
            <TableCell className="relative text-right">
              <RowActions
                onEdit={() => onEdit(match)}
                onDelete={() => onDelete(match.id)}
              />
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
    </>
  );
}
