import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { reportsApiService } from "../services/api";
import { seasonsApiService } from "../../seasons/services/api";
import { Loading } from "@/shared/components/Loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Card, CardContent } from "@/shared/components/ui/card";
import { BreadcrumbNav } from "@/shared/components/BreadcrumbNav";
import { t } from "@/shared/translations";

export const AttendanceReport = () => {
  const [selectedSeason, setSelectedSeason] = useState<string>("");

  const { data: seasonsData } = useQuery({
    queryKey: ["seasons"],
    queryFn: () => seasonsApiService.getSeasons(),
  });
  const seasons = seasonsData ?? [];

  const { data: statsData, isLoading, isError } = useQuery({
    queryKey: ["reports", "attendance", selectedSeason],
    queryFn: () => reportsApiService.getStadiumAttendance(parseInt(selectedSeason)),
    enabled: !!selectedSeason,
  });
  const stats = statsData ?? [];

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
      <BreadcrumbNav items={[{ label: t.common.reports, to: "/" }, { label: t.attendance.breadcrumb }]} />
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="text-primary" /> {t.attendance.title}
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
            {t.attendance.empty}
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Loading />
      ) : isError ? (
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="py-8 text-center text-destructive">
            {t.attendance.error}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.common.stadium}</TableHead>
                  <TableHead className="text-center">{t.attendance.capacity}</TableHead>
                  <TableHead className="text-center">{t.attendance.matches}</TableHead>
                  <TableHead className="text-center font-bold">{t.attendance.totalAttendance}</TableHead>
                  <TableHead className="text-center">{t.attendance.percentage}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">{t.common.noData}</TableCell>
                  </TableRow>
                ) : (
                  stats.map((stadium) => (
                    <TableRow key={stadium.id}>
                      <TableCell className="font-bold">{stadium.name}</TableCell>
                      <TableCell className="text-center">{stadium.capacity.toLocaleString()}</TableCell>
                      <TableCell className="text-center">{stadium.total_matches}</TableCell>
                      <TableCell className="text-center font-mono font-bold text-primary">{stadium.total_attendance.toLocaleString()}</TableCell>
                      <TableCell className="text-center font-mono">{stadium.attendance_percentage.toFixed(2)}%</TableCell>
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
