import { PageHeader } from "@/shared/components/PageHeader";
import { AppLink } from "@/shared/components/AppLink";
import { Field } from "@/shared/components/Field";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { reportsApiService } from "../services/api";
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
import { t } from "@/shared/translations";

export const HeadToHeadReport = () => {
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

      <PageHeader title={t.headToHead.title} />

      <div className="flex flex-wrap items-end gap-4">
        <Field label={t.headToHead.selectTeam1} className="w-64">
          <Select value={team1} onValueChange={setTeam1}>
            <SelectTrigger>
              <SelectValue placeholder={t.headToHead.selectTeam1} />
            </SelectTrigger>
            <SelectContent>
              {teams
                .filter((t) => t.id.toString() !== team2)
                .map((t) => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    {t.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={t.headToHead.selectTeam2} className="w-64">
          <Select value={team2} onValueChange={setTeam2}>
            <SelectTrigger>
              <SelectValue placeholder={t.headToHead.selectTeam2} />
            </SelectTrigger>
            <SelectContent>
              {teams
                .filter((t) => t.id.toString() !== team1)
                .map((t) => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    {t.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={t.common.season} className="w-64">
          <Select
            value={selectedSeason || "all"}
            onValueChange={(v) => setSelectedSeason(v === "all" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t.headToHead.allSeasons} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.headToHead.allSeasons}</SelectItem>
              {seasons.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {getSeasonLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {!team1 || !team2 ? (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            {t.headToHead.empty}
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Loading />
      ) : isError ? (
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="py-8 text-center text-destructive">
            {t.headToHead.error}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.common.date}</TableHead>
                  <TableHead>{t.common.stadium}</TableHead>
                  <TableHead>{t.common.home}</TableHead>
                  <TableHead className="text-center">{t.common.result}</TableHead>
                  <TableHead>{t.common.away}</TableHead>
                  <TableHead className="text-center">
                    {t.headToHead.homeAssists}
                  </TableHead>
                  <TableHead className="text-center">
                    {t.headToHead.awayAssists}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {t.headToHead.noMatches}
                    </TableCell>
                  </TableRow>
                ) : (
                  matches.map((match) => (
                    <TableRow key={match.id}>
                      <TableCell className="font-mono text-sm">
                        <AppLink href={`/matches/${match.id}`}>
                          {format(parseISO(match.match_date), "dd/MM/yyyy")}
                        </AppLink>
                      </TableCell>
                      <TableCell>{match.stadium_name}</TableCell>
                      <TableCell className="font-medium">
                        {match.home_team_name}
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {match.home_goals} - {match.away_goals}
                      </TableCell>
                      <TableCell className="font-medium">
                        {match.away_team_name}
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
