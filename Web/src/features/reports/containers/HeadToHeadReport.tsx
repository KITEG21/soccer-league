"use client";

import { PageHeader } from "@/shared/components/PageHeader";
import { AppLink } from "@/shared/components/AppLink";
import { APP_ROUTES } from "@/shared/config/routes";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { reportsApiService } from "../services/api";
import { ReportPdfButton } from "../components/ReportPdfButton";
import { seasonsApiService } from "@/features/seasons/services/api";
import { getSeasonLabel } from "@/features/seasons/utils";
import { teamsApiService } from "@/features/teams/services/api";
import { Loading } from "@/shared/components/Loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Card, CardContent } from "@/shared/components/ui/card";

export const HeadToHeadReport = () => {
  const t = useTranslations();
  const [team1Choice, setTeam1] = useState<string>();
  const [team2Choice, setTeam2] = useState<string>();
  const [selectedSeason, setSelectedSeason] = useState<string>("");

  const { data: teamsData } = useQuery({
    queryKey: ["teams"],
    queryFn: () => teamsApiService.getTeams(),
  });
  const teams = teamsData ?? [];

  const team1 = team1Choice ?? teams[0]?.id.toString() ?? "";
  const team2 = team2Choice ?? teams[1]?.id.toString() ?? "";

  const { data: seasonsData } = useQuery({
    queryKey: ["seasons"],
    queryFn: () => seasonsApiService.getSeasons(),
  });
  const seasons = seasonsData ?? [];

  const { data: matchesData, isLoading, isError } = useQuery({
    queryKey: ["reports", "head-to-head", team1, team2, selectedSeason],
    queryFn: () =>
      reportsApiService.getHeadToHead(
        parseInt(team1),
        parseInt(team2),
        selectedSeason ? parseInt(selectedSeason) : undefined,
      ),
    enabled: !!team1 && !!team2,
  });
  const matches = matchesData ?? [];

  return (
    <div className="space-y-6">

      <PageHeader
        title={t("Reports.headToHead.title")}
        actions={
            <ReportPdfButton
              url={reportsApiService.headToHeadPdfUrl(
                Number(team1),
                Number(team2),
                selectedSeason ? Number(selectedSeason) : undefined,
              )}
              disabled={!team1 || !team2 || isLoading || isError || matches.length === 0}
            />
        }
      />

      <div className="flex flex-wrap gap-4">
        <div className="min-w-52 flex-1 basis-56">
          <Select value={team1} onValueChange={setTeam1}>
            <SelectTrigger aria-label={t("Common.home")}>
              <SelectValue placeholder={t("Common.home")} />
            </SelectTrigger>
            <SelectContent>
              {teams
                .filter((team) => team.id.toString() !== team2)
                .map((team) => (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    {`${t("Common.home")}: ${team.name}`}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-52 flex-1 basis-56">
          <Select value={team2} onValueChange={setTeam2}>
            <SelectTrigger aria-label={t("Common.away")}>
              <SelectValue placeholder={t("Common.away")} />
            </SelectTrigger>
            <SelectContent>
              {teams
                .filter((team) => team.id.toString() !== team1)
                .map((team) => (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    {`${t("Common.away")}: ${team.name}`}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-52 flex-1 basis-56">
          <Select
            value={selectedSeason || "all"}
            onValueChange={(v) => setSelectedSeason(v === "all" ? "" : v)}
          >
            <SelectTrigger aria-label={t("Common.season")}>
              <SelectValue placeholder={t("Common.season")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{`${t("Common.season")}: ${t("Reports.headToHead.allSeasons")}`}</SelectItem>
              {seasons.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {`${t("Common.season")}: ${getSeasonLabel(s)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!team1 || !team2 ? (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("Reports.headToHead.empty")}
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Loading />
      ) : isError ? (
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="py-8 text-center text-destructive">
            {t("Reports.headToHead.error")}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Common.date")}</TableHead>
                  <TableHead>{t("Common.stadium")}</TableHead>
                  <TableHead>{t("Common.home")}</TableHead>
                  <TableHead className="text-center">{t("Common.result")}</TableHead>
                  <TableHead>{t("Common.away")}</TableHead>
                  <TableHead className="text-center">
                    {t("Reports.headToHead.homeAssists")}
                  </TableHead>
                  <TableHead className="text-center">
                    {t("Reports.headToHead.awayAssists")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {t("Reports.headToHead.noMatches")}
                    </TableCell>
                  </TableRow>
                ) : (
                  matches.map((match) => (
                    <TableRow key={match.id}>
                      <TableCell className="font-mono text-sm">
                        <AppLink href={APP_ROUTES.match(match.id)}>
                          {format(parseISO(match.match_date), "dd/MM/yyyy")}
                        </AppLink>
                      </TableCell>
                      <TableCell>
                        <AppLink href={APP_ROUTES.matches({ stadium_id: match.stadium_id })}>
                          {match.stadium_name}
                        </AppLink>
                      </TableCell>
                      <TableCell className="font-medium">
                        <AppLink href={APP_ROUTES.team(match.home_team_id)}>
                          {match.home_team_name}
                        </AppLink>
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {match.home_goals} - {match.away_goals}
                      </TableCell>
                      <TableCell className="font-medium">
                        <AppLink href={APP_ROUTES.team(match.away_team_id)}>
                          {match.away_team_name}
                        </AppLink>
                      </TableCell>
                      <TableCell className="text-center">
                        {match.home_assists}
                      </TableCell>
                      <TableCell className="text-center">
                        {match.away_assists}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
