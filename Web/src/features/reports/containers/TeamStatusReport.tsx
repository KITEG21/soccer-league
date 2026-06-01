import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck } from "lucide-react";
import { format, parseISO } from "date-fns";
import { reportsApiService } from "../services/api";
import { seasonsApiService } from "../../seasons/services/api";
import { teamsApiService } from "../../teams/services/api";
import { Loading } from "@/shared/components/Loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { BreadcrumbNav } from "@/shared/components/BreadcrumbNav";
import { t } from "@/shared/translations";

export const TeamStatusReport = () => {
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedSeason, setSelectedSeason] = useState<string>("");

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

  const { data: status, isLoading, isError } = useQuery({
    queryKey: ["reports", "team-status", selectedTeam, selectedSeason],
    queryFn: () => reportsApiService.getTeamStatus(parseInt(selectedTeam), parseInt(selectedSeason)),
    enabled: !!selectedTeam && !!selectedSeason,
  });

  const getSeasonLabel = (s: { id: number; start_date?: string; end_date?: string }) => {
    if (s.start_date && s.end_date) {
      try {
        return `${format(parseISO(s.start_date), "dd/MM/yyyy")} - ${format(parseISO(s.end_date), "dd/MM/yyyy")}`;
      } catch {
        return `Temporada ${s.id}`;
      }
    }
    return `Temporada ${s.id}`;
  };

  const statRow = (label: string, local: number, visitante: number, total: number) => (
    <TableRow>
      <TableCell className="font-medium">{label}</TableCell>
      <TableCell className="text-center font-mono">{local}</TableCell>
      <TableCell className="text-center font-mono">{visitante}</TableCell>
      <TableCell className="text-center font-mono font-bold">{total}</TableCell>
    </TableRow>
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <BreadcrumbNav items={[{ label: t.common.reports, to: "/" }, { label: t.teamStatus.title }]} />
      
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <ClipboardCheck className="text-primary" /> {t.teamStatus.title}
      </h1>

      <div className="flex flex-wrap gap-4">
        <div className="w-64">
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
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
        </div>
        <div className="w-64">
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
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
        </div>
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
            <CardTitle>{status.name}</CardTitle>
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
