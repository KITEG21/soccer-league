"use client";

import { PageHeader } from "@/shared/components/PageHeader";
import { AppLink } from "@/shared/components/AppLink";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { reportsApiService } from "../services/api";
import { ReportPdfButton } from "../components/ReportPdfButton";
import { seasonsApiService } from "@/features/seasons/services/api";
import { getSeasonLabel } from "@/features/seasons/utils";
import { teamsApiService } from "@/features/teams/services/api";
import { Loading } from "@/shared/components/Loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

export const TeamStatusReport = () => {
  const t = useTranslations();
  const [teamChoice, setTeamChoice] = useState<string>();
  const [seasonChoice, setSeasonChoice] = useState<string>();

  const { data: teamsData } = useQuery({
    queryKey: ["teams"],
    queryFn: () => teamsApiService.getTeams(),
  });
  const teams = teamsData ?? [];

  const { data: seasonsData } = useQuery({
    queryKey: ["seasons"],
    queryFn: () => seasonsApiService.getSeasons(),
  });
  const seasons = seasonsData ?? [];

  const selectedTeam = teamChoice ?? teams[0]?.id.toString() ?? "";
  const selectedSeason = seasonChoice ?? seasons[0]?.id.toString() ?? "";

  const { data: status, isLoading, isError } = useQuery({
    queryKey: ["reports", "team-status", selectedTeam, selectedSeason],
    queryFn: () => reportsApiService.getTeamStatus(parseInt(selectedTeam), parseInt(selectedSeason)),
    enabled: !!selectedTeam && !!selectedSeason,
  });

  const statRow = (label: string, local: number, visitante: number, total: number) => (
    <TableRow>
      <TableCell className="font-medium">{label}</TableCell>
      <TableCell className="text-center font-mono">{local}</TableCell>
      <TableCell className="text-center font-mono">{visitante}</TableCell>
      <TableCell className="text-center font-mono font-bold">{total}</TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      
      <PageHeader
        title={t("Reports.teamStatus.title")}
        actions={
            <ReportPdfButton
              url={reportsApiService.teamStatusPdfUrl(
                Number(selectedTeam),
                Number(selectedSeason),
              )}
              disabled={!selectedTeam || !selectedSeason || isLoading || !status}
            />
        }
      />

      <div className="flex flex-wrap gap-4">
        <div className="min-w-52 flex-1 basis-56">
          <Select value={selectedTeam} onValueChange={setTeamChoice}>
            <SelectTrigger aria-label={t("Common.team")}>
              <SelectValue placeholder={t("Common.team")} />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id.toString()}>
                  {`${t("Common.team")}: ${team.name}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-52 flex-1 basis-56">
          <Select value={selectedSeason} onValueChange={setSeasonChoice}>
            <SelectTrigger aria-label={t("Common.season")}>
              <SelectValue placeholder={t("Common.season")} />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {`${t("Common.season")}: ${getSeasonLabel(s)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedTeam || !selectedSeason ? (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("Reports.teamStatus.empty")}
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Loading />
      ) : isError ? (
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="py-8 text-center text-destructive">
            {t("Reports.teamStatus.error")}
          </CardContent>
        </Card>
      ) : status ? (
        <Card>
          <CardHeader>
            <CardTitle>
              <AppLink href={`/teams/${status.team_id}`}>{status.name}</AppLink>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Reports.teamStatus.stat")}</TableHead>
                  <TableHead className="text-center">{t("Common.home")}</TableHead>
                  <TableHead className="text-center">{t("Common.away")}</TableHead>
                  <TableHead className="text-center font-bold">{t("Reports.teamStatus.total")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statRow(t("Reports.teamStatus.wins"), status.home_wins, status.away_wins, status.total_wins)}
                {statRow(t("Reports.teamStatus.draws"), status.home_draws, status.away_draws, status.total_draws)}
                {statRow(t("Reports.teamStatus.losses"), status.home_losses, status.away_losses, status.total_losses)}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};
