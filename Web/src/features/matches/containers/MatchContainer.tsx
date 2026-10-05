"use client";

import { useMemo, useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { Match } from "../types";
import { matchesApiService } from "../services/api";
import { stadiumsApiService } from "../../stadiums/services/api";
import { seasonsApiService } from "../../seasons/services/api";
import { getSeasonLabel } from "../../seasons/utils";
import { useTeamOptions } from "../../teams/hooks/useTeamOptions";
import { MatchList } from "../components/MatchList";
import { MatchForm } from "../components/MatchForm";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { useListQuery, type FilterDefinition } from "@/shared/components/data-table";
import { usePermission } from "@/shared/hooks/use-permission";
import { useTranslations } from "next-intl";

export const MatchContainer = () => {
  const t = useTranslations("Matches");
  const common = useTranslations("Common");
  const canEdit = usePermission("matches:write");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | undefined>();
  const [matchToDelete, setMatchToDelete] = useState<number | undefined>();
  const queryClient = useQueryClient();
  const { options: teamOptions } = useTeamOptions();

  const { data: seasons = [] } = useQuery({
    queryKey: ["seasons"],
    queryFn: () => seasonsApiService.getSeasons(),
  });

  const { data: stadiums = [] } = useQuery({
    queryKey: ["stadiums"],
    queryFn: () => stadiumsApiService.getStadiums(),
  });

  const filters = useMemo<readonly FilterDefinition[]>(
    () => [
      {
        key: "season_id",
        label: t("season"),
        type: "select",
        options: seasons.map((season) => ({
          value: String(season.id),
          label: getSeasonLabel(season),
        })),
      },
      { key: "team_id", label: common("team"), type: "select", options: teamOptions },
      { key: "disputed", label: t("disputed"), type: "boolean" },
      {
        key: "stadium_id",
        label: t("stadium"),
        type: "select",
        options: stadiums.map((stadium) => ({ value: String(stadium.id), label: stadium.name })),
        advanced: true,
      },
      { key: "home_team_id", label: t("home"), type: "select", options: teamOptions, advanced: true },
      { key: "away_team_id", label: t("away"), type: "select", options: teamOptions, advanced: true },
      { key: "date", label: t("date"), type: "date-range", advanced: true },
      { key: "attendance", label: t("attendance"), type: "number-range", advanced: true },
    ],
    [seasons, stadiums, teamOptions, t, common],
  );
  const query = useListQuery({ filters });

  const {
    data: matchesPage,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["matches", "list", query.apiParams],
    queryFn: () => matchesApiService.getMatchesPage(query.apiParams),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => matchesApiService.deleteMatch(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["matches"] });
      setMatchToDelete(undefined);
    },
  });

  const handleCreate = () => {
    setEditingMatch(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (match: Match) => {
    setEditingMatch(match);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.reset();
    setMatchToDelete(id);
  };

  const handleCloseDeleteDialog = () => {
    setMatchToDelete(undefined);
    deleteMutation.reset();
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingMatch(undefined);
  };

  return (
    <div className="space-y-6">
      <MatchList
        matches={matchesPage?.data ?? []}
        total={matchesPage?.total ?? 0}
        query={query}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        onCreate={canEdit ? handleCreate : undefined}
        onEdit={canEdit ? handleEdit : undefined}
        onDelete={canEdit ? handleDelete : undefined}
      />
      {canEdit && (
        <MatchForm
          match={editingMatch}
          isOpen={isFormOpen}
          onClose={handleCloseForm}
        />
      )}
      <ConfirmDialog
        isOpen={matchToDelete !== undefined}
        onClose={handleCloseDeleteDialog}
        onConfirm={() => matchToDelete !== undefined && deleteMutation.mutate(matchToDelete)}
        title={t("deleteTitle")}
        description={t("deleteDescription")}
        confirmText={t("delete")}
        cancelText={common("cancel")}
        isLoading={deleteMutation.isPending}
        error={
          deleteMutation.isError
            ? deleteMutation.error instanceof Error
              ? deleteMutation.error.message
              : t("loadError")
            : null
        }
      />
    </div>
  );
};
