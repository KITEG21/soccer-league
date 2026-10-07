"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/utils";
import { PageHeader } from "@/shared/components/PageHeader";
import { AppLink } from "@/shared/components/AppLink";
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
import { seasonsApiService } from "@/features/seasons/services/api";
import { getSeasonLabel } from "@/features/seasons/utils";
import { reportsApiService } from "../services/api";
import { ReportPdfButton } from "../components/ReportPdfButton";

const PODIUM = [
  { row: "border-amber-500 bg-amber-500/10", rank: "text-amber-600 dark:text-amber-400" },
  { row: "border-slate-400 bg-slate-400/10", rank: "text-slate-600 dark:text-slate-300" },
  { row: "border-orange-700 bg-orange-700/10", rank: "text-orange-700 dark:text-orange-400" },
] as const;

export const StandingsReport = () => {
  const t = useTranslations();
  const columns = [t("Reports.standings.pos"), t("Reports.standings.team"), t("Reports.standings.pts")];
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
        title={t("Reports.standings.title")}
        actions={
          <>
          <Select value={selectedSeason} onValueChange={setSeasonChoice}>
            <SelectTrigger className="w-72 sm:w-80" aria-label={t("Common.season")}>
              <SelectValue placeholder={t("Common.season")} />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((season) => (
                <SelectItem key={season.id} value={season.id.toString()}>
                  {`${t("Common.season")}: ${getSeasonLabel(season)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ReportPdfButton
            url={reportsApiService.standingsPdfUrl(Number(selectedSeason))}
            disabled={!selectedSeason || isLoading || standings.length === 0}
          />
          </>
        }
      />

      <DataTable
        columns={columns}
        isLoading={isLoading || !selectedSeason}
        error={isError || null}
        errorMessage={t("Reports.standings.error")}
        isEmpty={standings.length === 0}
        emptyMessage={t("Common.noData")}
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
                  <AppLink href={`/teams/${row.team_id}`}>{row.name}</AppLink>
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
