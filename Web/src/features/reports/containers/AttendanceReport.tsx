"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/shared/components/PageHeader";
import { AppLink } from "@/shared/components/AppLink";
import { APP_ROUTES } from "@/shared/config/routes";
import { DataTable } from "@/shared/components/DataTable";
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

export const AttendanceReport = () => {
  const t = useTranslations();
  const columns = [
    t("Common.stadium"), t("Reports.attendance.capacity"), t("Reports.attendance.matches"),
    t("Reports.attendance.totalAttendance"), t("Reports.attendance.percentage"),
  ];
  const [seasonChoice, setSeasonChoice] = useState<string>();

  const { data: seasons = [] } = useQuery({
    queryKey: ["seasons"],
    queryFn: () => seasonsApiService.getSeasons(),
  });

  const selectedSeason = seasonChoice ?? seasons[0]?.id.toString() ?? "";

  const {
    data: stats = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["reports", "attendance", selectedSeason],
    queryFn: () =>
      reportsApiService.getStadiumAttendance(parseInt(selectedSeason)),
    enabled: !!selectedSeason,
  });

  return (
    <>
      <PageHeader
        title={t("Reports.attendance.title")}
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
            url={reportsApiService.stadiumAttendancePdfUrl(Number(selectedSeason))}
            disabled={!selectedSeason || isLoading || stats.length === 0}
          />
          </>
        }
      />

      <DataTable
        columns={columns}
        isLoading={isLoading || !selectedSeason}
        error={isError || null}
        errorMessage={t("Reports.attendance.error")}
        isEmpty={stats.length === 0}
        emptyMessage={t("Common.noData")}
      >
        {stats.map((stadium) => (
          <TableRow key={stadium.id}>
            <TableCell className="font-medium">
              <AppLink
                href={APP_ROUTES.matches({ stadium_id: stadium.id, season_id: selectedSeason })}
              >
                {stadium.name}
              </AppLink>
            </TableCell>
            <TableCell className="tabular-nums text-muted-foreground">
              {stadium.capacity.toLocaleString("es")}
            </TableCell>
            <TableCell className="tabular-nums">
              {stadium.total_matches}
            </TableCell>
            <TableCell className="font-medium tabular-nums text-primary">
              {stadium.total_attendance.toLocaleString("es")}
            </TableCell>
            <TableCell className="tabular-nums">
              {stadium.attendance_percentage.toFixed(1)}%
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
    </>
  );
};
