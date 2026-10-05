"use client";

import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { AppLink } from "@/shared/components/AppLink";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DataTableToolbar,
  ServerDataTable,
  useListQuery,
  type dataTableFeatures,
  type FilterDefinition,
} from "@/shared/components/data-table";
import { usePermission } from "@/shared/hooks/use-permission";
import { TeamPickerDialog } from "@/features/teams/components/TeamPickerDialog";
import { useTeamOptions } from "@/features/teams/hooks/useTeamOptions";
import { playersApiService } from "../services/api";
import { PLAYER_POSITIONS } from "../constants";
import type { Player } from "../types";
import { useTranslations } from "next-intl";
import { PlayerForm } from "./PlayerForm";

const columnHelper = createColumnHelper<typeof dataTableFeatures, Player>();

export const PlayerGlobalList = () => {
  const t = useTranslations("Lists");
  const common = useTranslations("Common");
  const canEdit = usePermission("players:write");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const { options: teamOptions } = useTeamOptions();

  const filters = useMemo<readonly FilterDefinition[]>(
    () => [
      { key: "team_id", label: common("team"), type: "select", options: teamOptions },
      { key: "position", label: common("position"), type: "select", options: PLAYER_POSITIONS },
      { key: "years_in_team", label: common("yearsInTeam"), type: "number-range", advanced: true },
      { key: "number", label: common("number"), type: "text", placeholder: common("number"), advanced: true },
    ],
    [teamOptions, common],
  );
  const query = useListQuery({ filters });

  const {
    data: playersPage,
    isLoading: isLoadingPlayers,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["players", "list", query.apiParams],
    queryFn: () => playersApiService.getPlayersPage(query.apiParams),
    placeholderData: keepPreviousData,
  });

  const columns = columnHelper.columns([
    columnHelper.accessor("number", {
      header: "#",
      cell: ({ getValue }) => (
        <Badge variant="secondary" className="font-mono">
          {getValue() ?? "—"}
        </Badge>
      ),
    }),
    columnHelper.accessor("name", {
      header: common("name"),
      meta: { cellClassName: "font-medium" },
    }),
    columnHelper.accessor("team_name", {
      header: common("team"),
      cell: ({ row }) =>
        row.original.team_id ? (
          <AppLink href={`/teams/${row.original.team_id}`}>
            {row.original.team_name ?? t("teamFallback", { id: row.original.team_id })}
          </AppLink>
        ) : (
          <span className="text-muted-foreground">{t("noTeam")}</span>
        ),
    }),
    columnHelper.accessor("position", {
      header: common("position"),
      cell: ({ getValue }) => (
        <span className="text-xs font-semibold uppercase text-primary">{getValue()}</span>
      ),
    }),
    columnHelper.accessor("years_in_team", {
      header: common("yearsInTeam"),
      cell: ({ getValue }) => getValue() ?? 0,
      meta: { cellClassName: "tabular-nums" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("playersTitle")}
        description={t("playersDescription")}
        actions={
          canEdit && (
            <Button onClick={() => setIsPickerOpen(true)}>
              <Plus />
              {t("newPlayer")}
            </Button>
          )
        }
      />

      <TeamPickerDialog
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(teamId) => {
          setSelectedTeamId(teamId);
          setIsPickerOpen(false);
        }}
        title={t("chooseTeam")}
        description={t("playerTeamDescription")}
      />

      {selectedTeamId !== null && (
        <PlayerForm
          teamId={selectedTeamId}
          isOpen
          onClose={() => setSelectedTeamId(null)}
        />
      )}

      <DataTableToolbar query={query} searchPlaceholder={t("searchPlayers")} />

      <ServerDataTable
        columns={columns}
        data={playersPage?.data ?? []}
        total={playersPage?.total ?? 0}
        query={query}
        getRowId={(player) => String(player.id)}
        isLoading={isLoadingPlayers}
        isFetching={isFetching}
        error={error}
        errorMessage={t("playersLoadError")}
        emptyMessage={t("playersEmpty")}
      />
    </div>
  );
};
