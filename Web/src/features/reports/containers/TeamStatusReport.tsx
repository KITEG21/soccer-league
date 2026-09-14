import { PageHeader } from "@/shared/components/PageHeader";
import { AppLink } from "@/shared/components/AppLink";
import { Field } from "@/shared/components/Field";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsApiService } from "../services/api";
import { seasonsApiService } from "@/features/seasons/services/api";
import { getSeasonLabel } from "@/features/seasons/utils";
import { teamsApiService } from "@/features/teams/services/api";
import { Loading } from "@/shared/components/Loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { t } from "@/shared/translations";

export const TeamStatusReport = () => {
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
      
      <PageHeader title={t.teamStatus.title} />

      <div className="flex flex-wrap items-end gap-4">
        <Field label={t.common.team} className="w-64">
          <Select value={selectedTeam} onValueChange={setTeamChoice}>
            <SelectTrigger>
              <SelectValue placeholder={t.common.selectTeam} />
            </SelectTrigger>
            <SelectContent>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id.toString()}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={t.common.season} className="w-64">
          <Select value={selectedSeason} onValueChange={setSeasonChoice}>
            <SelectTrigger>
              <SelectValue placeholder={t.common.selectSeason} />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {getSeasonLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {!selectedTeam || !selectedSeason ? (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            {t.teamStatus.empty}
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Loading />
      ) : isError ? (
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="py-8 text-center text-destructive">
            {t.teamStatus.error}
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
                  <TableHead>{t.teamStatus.stat}</TableHead>
                  <TableHead className="text-center">{t.common.home}</TableHead>
                  <TableHead className="text-center">{t.common.away}</TableHead>
                  <TableHead className="text-center font-bold">{t.teamStatus.total}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statRow(t.teamStatus.wins, status.home_wins, status.away_wins, status.total_wins)}
                {statRow(t.teamStatus.draws, status.home_draws, status.away_draws, status.total_draws)}
                {statRow(t.teamStatus.losses, status.home_losses, status.away_losses, status.total_losses)}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};
