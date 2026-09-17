"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/shared/components/PageHeader";
import { AppLink } from "@/shared/components/AppLink";
import { APP_ROUTES } from "@/shared/config/routes";
import { Field } from "@/shared/components/Field";
import { DataTable } from "@/shared/components/DataTable";
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

const COLUMNS = [
  t.common.stadium,
  t.attendance.capacity,
  t.attendance.matches,
  t.attendance.totalAttendance,
  t.attendance.percentage,
];

export const AttendanceReport = () => {
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
        title={t.attendance.title}
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
        errorMessage={t.attendance.error}
        isEmpty={stats.length === 0}
        emptyMessage={t.common.noData}
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
