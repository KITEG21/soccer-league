"use client";

import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowRight, Calendar, Flag, Trophy, Users } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { AppLink } from "@/shared/components/AppLink";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/utils";
import { teamsApiService } from "@/features/teams/services/api";
import { playersApiService } from "@/features/players/services/api";
import { matchesApiService } from "@/features/matches/services/api";
import { seasonsApiService } from "@/features/seasons/services/api";
import { reportsApiService } from "@/features/reports/services/api";
import { StatCard } from "../components/StatCard";

const UPCOMING_LIMIT = 5;
const STANDINGS_LIMIT = 5;

const PODIUM = [
  { row: "border-amber-500 bg-amber-500/10", rank: "text-amber-600 dark:text-amber-400" },
  { row: "border-slate-400 bg-slate-400/10", rank: "text-slate-600 dark:text-slate-300" },
  { row: "border-orange-700 bg-orange-700/10", rank: "text-orange-700 dark:text-orange-400" },
] as const;

const formatSeason = (start: string | undefined, end: string | undefined, locale: typeof es, undefinedLabel: string) => {
  if (!start || !end) return undefinedLabel;
  try {
    const from = format(parseISO(start), "MMM yyyy", { locale });
    const to = format(parseISO(end), "MMM yyyy", { locale });
    return `${from} – ${to}`;
  } catch {
    return undefinedLabel;
  }
};

export const DashboardPage = () => {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const dateLocale = locale === "es" ? es : enUS;
  const { data: teams, isLoading: isLoadingTeams } = useQuery({
    queryKey: ["teams", "count"],
    queryFn: () => teamsApiService.getTeamsPage({ limit: 1 }),
  });

  const { data: players, isLoading: isLoadingPlayers } = useQuery({
    queryKey: ["players", "count"],
    queryFn: () => playersApiService.getPlayersPage({ limit: 1 }),
  });

  const { data: matches = [], isLoading: isLoadingMatches } = useQuery({
    queryKey: ["matches", "all"],
    queryFn: () => matchesApiService.getMatches(),
  });

  const { data: seasons = [], isLoading: isLoadingSeasons } = useQuery({
    queryKey: ["seasons"],
    queryFn: () => seasonsApiService.getSeasons(),
  });

  const currentSeason = [...seasons].sort((a, b) =>
    (b.end_date ?? "").localeCompare(a.end_date ?? ""),
  )[0];

  const { data: standings = [], isLoading: isLoadingStandings } = useQuery({
    queryKey: ["standings", currentSeason?.id],
    queryFn: () => reportsApiService.getStandings(currentSeason!.id),
    enabled: currentSeason !== undefined,
  });

  const upcoming = matches
    .filter((match) => !match.disputed)
    .sort(
      (a, b) =>
        new Date(a.match_date).getTime() - new Date(b.match_date).getTime(),
    )
    .slice(0, UPCOMING_LIMIT);

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("teams")}
          value={teams?.total ?? 0}
          icon={Users}
          isLoading={isLoadingTeams}
        />
        <StatCard
          label={t("players")}
          value={players?.total ?? 0}
          icon={Users}
          isLoading={isLoadingPlayers}
        />
        <StatCard
          label={t("matches")}
          value={matches.length}
          hint={`${upcoming.length} ${t("toPlay")}`}
          icon={Flag}
          isLoading={isLoadingMatches}
        />
        <StatCard
          label={t("currentSeason")}
          value={
            currentSeason
              ? formatSeason(currentSeason.start_date, currentSeason.end_date, dateLocale, t("undefined"))
              : t("noSeason")
          }
          hint={`${seasons.length} ${t("registered")}`}
          icon={Calendar}
          isLoading={isLoadingSeasons}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("upcoming")}</CardTitle>
            <CardDescription>
              {t("upcomingDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingMatches &&
              [1, 2, 3].map((row) => <Skeleton key={row} className="h-12" />)}

            {!isLoadingMatches && upcoming.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t("noUpcoming")}
              </p>
            )}

            {!isLoadingMatches &&
              upcoming.map((match) => (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {match.home_team_name ?? match.home_team?.name ?? t("teamFallback", { id: match.home_team_id })}
                      <span className="px-1.5 text-muted-foreground">vs</span>
                      {match.away_team_name ?? match.away_team?.name ?? t("teamFallback", { id: match.away_team_id })}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {match.stadium_name ?? match.stadium?.name ?? t("stadiumFallback", { id: match.stadium_id })}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {format(new Date(match.match_date), "dd MMM HH:mm", {
                      locale: dateLocale,
                    })}
                  </span>
                </Link>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <CardTitle>{t("standings")}</CardTitle>
                <CardDescription>
                  {currentSeason
                    ? formatSeason(
                        currentSeason.start_date,
                        currentSeason.end_date, dateLocale, t("undefined"),
                      )
                    : t("noActiveSeason")}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="-mt-1 shrink-0" asChild>
                <Link href="/reports/standings">
                  {t("viewFullStandings")}
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoadingStandings &&
              [1, 2, 3].map((row) => <Skeleton key={row} className="h-10" />)}

            {!isLoadingStandings && standings.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t("noStandings")}
              </p>
            )}

            {!isLoadingStandings &&
              standings.slice(0, STANDINGS_LIMIT).map((row, index) => {
                const podium = PODIUM[index];

                return (
                  <div
                    key={row.team_id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border-l-2 px-3 py-2",
                      podium?.row ?? "border-transparent",
                    )}
                  >
                    <span
                      className={cn(
                        "w-5 text-sm font-semibold tabular-nums",
                        podium?.rank ?? "text-muted-foreground",
                      )}
                    >
                      {index + 1}
                    </span>
                    {index === 0 ? (
                      <Trophy className="size-4 shrink-0 text-amber-500" />
                    ) : (
                      <span className="size-4 shrink-0" />
                    )}
                    <AppLink
                      href={`/teams/${row.team_id}`}
                      className="min-w-0 flex-1 truncate text-sm font-medium"
                    >
                      {row.name}
                    </AppLink>
                    <Badge
                      variant={index === 0 ? "default" : "secondary"}
                      className="tabular-nums"
                    >
                      {row.points} pts
                    </Badge>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </div>
    </>
  );
};
