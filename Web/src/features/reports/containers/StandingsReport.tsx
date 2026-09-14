"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { cn } from "@/shared/utils";
import { PageHeader } from "@/shared/components/PageHeader";
import { Field } from "@/shared/components/Field";
import { DataTable } from "@/shared/components/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { TableCell, TableRow } from "@/shared/components/ui/table";
import { t } from "@/shared/translations";
import { seasonsApiService } from "@/features/seasons/services/api";
import { getSeasonLabel } from "@/features/seasons/utils";
import { reportsApiService } from "../services/api";

const COLUMNS = [t.standings.pos, t.standings.team, t.standings.pts];

const PODIUM = [
  { row: "border-amber-500 bg-amber-500/10", rank: "text-amber-600 dark:text-amber-400" },
  { row: "border-slate-400 bg-slate-400/10", rank: "text-slate-600 dark:text-slate-300" },
  { row: "border-orange-700 bg-orange-700/10", rank: "text-orange-700 dark:text-orange-400" },
] as const;

export const StandingsReport = () => {
  const [seasonChoice, setSeasonChoice] = useState<string>();

  const { data: seasons = [] } = useQuery({
    queryKey: ["seasons"],
    queryFn: () => seasonsApiService.getSeasons(),
  });

  const selectedSeason = seasonChoice ?? seasons[0]?.id.toString() ?? "";

  const {
    data: standings = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["standings", selectedSeason],
    queryFn: () => reportsApiService.getStandings(parseInt(selectedSeason)),
    enabled: !!selectedSeason,
  });

  return (
    <>
      <PageHeader
        title={t.standings.title}
        actions={
          <Field label={t.common.season}>
            <Select value={selectedSeason} onValueChange={setSeasonChoice}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder={t.common.selectSeason} />
              </SelectTrigger>
              <SelectContent>
                {seasons.map((season) => (
                  <SelectItem key={season.id} value={season.id.toString()}>
                    {getSeasonLabel(season)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        }
      />

      <DataTable
        columns={COLUMNS}
        isLoading={isLoading || !selectedSeason}
        error={isError || null}
        errorMessage={t.standings.error}
        isEmpty={standings.length === 0}
        emptyMessage={t.common.noData}
      >
        {standings.map((row, index) => {
          const podium = PODIUM[index];

          return (
            <TableRow
              key={row.team_id}
              className={cn("border-l-2 border-transparent", podium?.row)}
            >
              <TableCell className="w-12">
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    podium?.rank ?? "text-muted-foreground",
                  )}
                >
                  {index + 1}
                </span>
              </TableCell>
              <TableCell className="font-medium">
                <span className="flex items-center gap-2">
                  {row.name}
                  {index === 0 && (
                    <Trophy className="size-4 shrink-0 text-amber-500" />
                  )}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant={index === 0 ? "default" : "secondary"}
                  className="tabular-nums"
                >
                  {row.points}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </DataTable>
    </>
  );
};
