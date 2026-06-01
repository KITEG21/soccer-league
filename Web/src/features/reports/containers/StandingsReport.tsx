import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { format, parseISO } from "date-fns";
import { reportsApiService } from "../services/api";
import { seasonsApiService } from "../../seasons/services/api";
import { Loading } from "@/shared/components/Loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Card, CardContent } from "@/shared/components/ui/card";
import { BreadcrumbNav } from "@/shared/components/BreadcrumbNav";
import { t } from "@/shared/translations";

export const StandingsReport = () => {
  const [selectedSeason, setSelectedSeason] = useState<string>("");

  const { data: seasonsData } = useQuery({
    queryKey: ["seasons"],
    queryFn: () => seasonsApiService.getSeasons(),
  });
  const seasons = seasonsData ?? [];

  const { data: standingsData, isLoading, isError } = useQuery({
    queryKey: ["standings", selectedSeason],
    queryFn: () => reportsApiService.getStandings(parseInt(selectedSeason)),
    enabled: !!selectedSeason,
  });
  const standings = standingsData ?? [];

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
      <BreadcrumbNav items={[{ label: t.common.reports, to: "/" }, { label: t.standings.title }]} />
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="text-primary" /> {t.standings.title}
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
            {t.standings.empty}
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Loading />
      ) : isError ? (
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="py-8 text-center text-destructive">
            {t.standings.error}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">{t.standings.pos}</TableHead>
                  <TableHead>{t.standings.team}</TableHead>
                  <TableHead className="text-center font-bold text-primary">{t.standings.pts}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {standings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">{t.common.noData}</TableCell>
                  </TableRow>
                ) : (
                  standings.map((row, index) => (
                    <TableRow key={row.team_id}>
                      <TableCell className="text-center font-bold">{index + 1}</TableCell>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-center font-bold text-primary">{row.points}</TableCell>
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
