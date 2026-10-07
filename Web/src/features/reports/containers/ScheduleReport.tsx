"use client";

import { PageHeader } from "@/shared/components/PageHeader";
import { AppLink } from "@/shared/components/AppLink";
import { APP_ROUTES } from "@/shared/config/routes";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { reportsApiService } from "../services/api";
import { ReportPdfButton } from "../components/ReportPdfButton";
import { stadiumsApiService } from "@/features/stadiums/services/api";
import { useLatestMatch } from "@/features/matches/hooks/useLatestMatch";
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
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared/utils";

export const ScheduleReport = () => {
  const t = useTranslations();
  const [dateChoice, setDateChoice] = useState<Date>();
  const [selectedStadium, setSelectedStadium] = useState<string>("");

  const { data: stadiumsData } = useQuery({
    queryKey: ["stadiums"],
    queryFn: () => stadiumsApiService.getStadiums(),
  });
  const stadiums = stadiumsData ?? [];

  const { match: latestMatch, isPending: isResolvingDefaults } = useLatestMatch();

  const selectedDate =
    dateChoice ??
    (latestMatch ? new Date(latestMatch.match_date) : undefined);


  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

  const { data: matchesData, isLoading, isError } = useQuery({
    queryKey: ["reports", "schedule", dateStr, selectedStadium],
    queryFn: () =>
      reportsApiService.getSchedule(
        dateStr,
        selectedStadium ? parseInt(selectedStadium) : undefined,
      ),
    enabled: !!selectedDate,
  });
  const matches = matchesData ?? [];

  return (
    <div className="space-y-6">

      <PageHeader
        title={t("Reports.schedule.title")}
        actions={
            <ReportPdfButton
              url={reportsApiService.schedulePdfUrl(
                dateStr,
                selectedStadium ? Number(selectedStadium) : undefined,
              )}
              disabled={!dateStr || isLoading || isError || matches.length === 0}
            />
        }
      />

      <div className="flex flex-wrap gap-4">
        <div className="min-w-52 flex-1 basis-56">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                aria-label={t("Common.date")}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  `${t("Common.date")}: ${format(selectedDate, "PPP", { locale: es })}`
                ) : (
                  <span>{t("Reports.schedule.selectDate")}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setDateChoice}
                autoFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="min-w-52 flex-1 basis-56">
          <Select
            value={selectedStadium || "all"}
            onValueChange={(v) =>
              setSelectedStadium(v === "all" ? "" : v)
            }
          >
            <SelectTrigger aria-label={t("Common.stadium")}>
              <SelectValue placeholder={t("Common.stadium")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{`${t("Common.stadium")}: ${t("Reports.schedule.allStadiums")}`}</SelectItem>
              {stadiums.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {`${t("Common.stadium")}: ${s.name}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isResolvingDefaults ? (
        <Loading />
      ) : !selectedDate ? (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("Reports.schedule.empty")}
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Loading />
      ) : isError ? (
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="py-8 text-center text-destructive">
            {t("Reports.schedule.error")}
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
                  <TableHead className="text-center">{t("Reports.schedule.attendance")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {t("Reports.schedule.noMatches")}
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
                      <TableCell className="text-center font-mono">
                        {match.attendance.toLocaleString()}
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
