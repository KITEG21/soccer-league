import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { format, parseISO } from "date-fns";
import { reportsApiService } from "../services/api";
import { seasonsApiService } from "../../seasons/services/api";
import { Loading } from "@/shared/components/Loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { BreadcrumbNav } from "@/shared/components/BreadcrumbNav";
import { t } from "@/shared/translations";

const METRIC_LABELS: Record<string, string> = t.allStar.metricLabels;

const ALL_STATS = Object.entries(t.allStar.statLabels).map(([key, label]) => ({
  key,
  label,
})) as readonly { key: string; label: string }[];

export const AllStarReport = () => {
  const [selectedSeason, setSelectedSeason] = useState<string>("");

  const { data: seasonsData } = useQuery({
    queryKey: ["seasons"],
    queryFn: () => seasonsApiService.getSeasons(),
  });
  const seasons = seasonsData ?? [];

  const { data: playersData, isLoading, isError } = useQuery({
    queryKey: ["reports", "all-star", selectedSeason],
    queryFn: () => reportsApiService.getAllStarTeam(parseInt(selectedSeason)),
    enabled: !!selectedSeason,
  });
  const players = playersData ?? [];

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

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <BreadcrumbNav items={[{ label: t.common.reports, to: "/" }, { label: t.allStar.breadcrumb }]} />
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Star className="text-primary" /> {t.allStar.title}
        </h1>
        
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

      {!selectedSeason ? (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            {t.allStar.empty}
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Loading />
      ) : isError ? (
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="py-8 text-center text-destructive">
            {t.allStar.error}
          </CardContent>
        </Card>
      ) : players.length === 0 ? (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            {t.allStar.noData}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {players.map((player, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="uppercase text-xs font-black text-muted-foreground">{player.position}</span>
                  <span>—</span>
                  <span>{player.player_name}</span>
                  <span className="text-muted-foreground font-normal">({player.team_name})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">{t.allStar.keyMetric}</p>
                    <p className="text-lg font-bold text-primary">{METRIC_LABELS[player.metric_name] || player.metric_name}</p>
                    <p className="text-3xl font-black text-primary">{player.metric_value}</p>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {ALL_STATS.map((stat) => (
                        <TableHead key={stat.key} className="text-center">{stat.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      {ALL_STATS.map((stat) => (
                        <TableCell key={stat.key} className="text-center font-mono">
                          {player[stat.key as keyof typeof player]}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
