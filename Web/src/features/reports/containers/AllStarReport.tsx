"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/shared/components/PageHeader";
import { Field } from "@/shared/components/Field";
import { Loading } from "@/shared/components/Loading";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/utils";
import { t } from "@/shared/translations";
import { seasonsApiService } from "@/features/seasons/services/api";
import { getSeasonLabel } from "@/features/seasons/utils";
import { reportsApiService } from "../services/api";
import type { AllStarPlayer } from "../types";

const METRIC_LABELS: Record<string, string> = t.allStar.metricLabels;

const STATS = [
  { key: "goals_scored", short: "GOL" },
  { key: "assists", short: "AST" },
  { key: "shots_on_goal", short: "TIR" },
  { key: "passes_completed", short: "PAS" },
  { key: "interceptions", short: "INT" },
  { key: "tackles", short: "ENT" },
  { key: "blocks", short: "BLO" },
  { key: "saves", short: "PAR" },
  { key: "goals_conceded", short: "GC" },
] as const;

const METRIC_SOURCES: Record<string, readonly string[]> = {
  shots_on_goal: ["shots_on_goal"],
  passes_completed_plus_interceptions: ["passes_completed", "interceptions"],
  tackles_plus_blocks: ["tackles", "blocks"],
  saves_minus_goals_conceded: ["saves", "goals_conceded"],
};

const STAT_LABELS: Record<string, string> = t.allStar.statLabels;

const PlayerCard = ({ player }: { readonly player: AllStarPlayer }) => {
  const sources = METRIC_SOURCES[player.metric_name] ?? [];

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <Badge variant="secondary" className="uppercase">
              {player.position}
            </Badge>
            <p className="truncate font-semibold">{player.player_name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {player.team_name}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="font-mono text-3xl font-semibold leading-none text-primary tabular-nums">
              {player.metric_value}
            </p>
            <p className="mt-1 max-w-28 text-[11px] leading-tight text-muted-foreground">
              {METRIC_LABELS[player.metric_name] || player.metric_name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 border-t pt-3">
          {STATS.map((stat) => {
            const value = player[stat.key] ?? 0;
            const isSource = sources.includes(stat.key);

            return (
              <Tooltip key={stat.key}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "flex cursor-default items-baseline justify-between gap-1 rounded px-1.5 py-1 transition-colors",
                      isSource ? "bg-primary/10" : "hover:bg-accent",
                      !isSource && value === 0 && "opacity-40",
                    )}
                  >
                    <span className="text-[10px] font-medium tracking-wide text-muted-foreground">
                      {stat.short}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-sm tabular-nums",
                        isSource && "font-semibold text-primary",
                      )}
                    >
                      {value}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <span className="font-medium">{STAT_LABELS[stat.key]}</span>
                  <span className="ml-1.5 font-mono tabular-nums">{value}</span>
                  {isSource && (
                    <span className="ml-1.5 opacity-70">· define el puesto</span>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export const AllStarReport = () => {
  const [seasonChoice, setSeasonChoice] = useState<string>();

  const { data: seasons = [] } = useQuery({
    queryKey: ["seasons"],
    queryFn: () => seasonsApiService.getSeasons(),
  });

  const selectedSeason = seasonChoice ?? seasons[0]?.id.toString() ?? "";

  const {
    data: players = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["reports", "all-star", selectedSeason],
    queryFn: () => reportsApiService.getAllStarTeam(parseInt(selectedSeason)),
    enabled: !!selectedSeason,
  });

  const renderContent = () => {
    if (!selectedSeason) {
      return (
        <Card className="border-dashed bg-muted/50">
          <CardContent className="py-12 text-center text-muted-foreground">
            {t.allStar.empty}
          </CardContent>
        </Card>
      );
    }

    if (isLoading) return <Loading />;

    if (isError) {
      return (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="py-8 text-center text-destructive">
            {t.allStar.error}
          </CardContent>
        </Card>
      );
    }

    if (players.length === 0) {
      return (
        <Card className="border-dashed bg-muted/50">
          <CardContent className="py-12 text-center text-muted-foreground">
            {t.allStar.noData}
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {players.map((player) => (
          <PlayerCard
            key={`${player.position}-${player.player_name}`}
            player={player}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <PageHeader
        title={t.allStar.title}
        actions={
          <Field label={t.common.season}>
            <Select value={selectedSeason} onValueChange={setSeasonChoice}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder={t.common.selectSeason} />
              </SelectTrigger>
              <SelectContent>
                {seasons.map((season) => (
                  <SelectItem key={season.id} value={season.id.toString()}>
                    {getSeasonLabel(season)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        }
      />

      {renderContent()}
    </>
  );
};
