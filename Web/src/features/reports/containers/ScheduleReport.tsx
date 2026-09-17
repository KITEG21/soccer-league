"use client";

import { PageHeader } from "@/shared/components/PageHeader";
import { AppLink } from "@/shared/components/AppLink";
import { Field } from "@/shared/components/Field";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { reportsApiService } from "../services/api";
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
import { t } from "@/shared/translations";

export const ScheduleReport = () => {
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

      <PageHeader title={t.schedule.title} />

      <div className="flex flex-wrap gap-4 items-end">
        <Field label={t.common.date} className="w-64">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "PPP", { locale: es })
                ) : (
                  <span>{t.schedule.selectDate}</span>
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
        </Field>
        <Field label={t.common.stadium} className="w-64">
          <Select
            value={selectedStadium || "all"}
            onValueChange={(v) =>
              setSelectedStadium(v === "all" ? "" : v)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t.schedule.allStadiums} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.schedule.allStadiums}</SelectItem>
              {stadiums.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {isResolvingDefaults ? (
        <Loading />
      ) : !selectedDate ? (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            {t.schedule.empty}
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Loading />
      ) : isError ? (
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="py-8 text-center text-destructive">
            {t.schedule.error}
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
                  <TableHead className="text-center">{t.schedule.attendance}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {t.schedule.noMatches}
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
