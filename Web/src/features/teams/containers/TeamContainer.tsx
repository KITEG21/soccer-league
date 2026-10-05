"use client";

import { useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { Team } from "../types";
import { teamsApiService } from "../services/api";
import { getTeamFilters, TeamList } from "../components/TeamList";
import { TeamForm } from "../components/TeamForm";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { useListQuery } from "@/shared/components/data-table";
import { usePermission } from "@/shared/hooks/use-permission";
import { useTranslations } from "next-intl";

export const TeamContainer = () => {
  const t = useTranslations();
  const common = useTranslations("Common");
  const canEdit = usePermission("teams:write");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | undefined>();
  const [teamToDelete, setTeamToDelete] = useState<number | undefined>();
  const queryClient = useQueryClient();
  const query = useListQuery({ filters: getTeamFilters(t) });

  const {
    data: teamsPage,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["teams", "list", query.apiParams],
    queryFn: () => teamsApiService.getTeamsPage(query.apiParams),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => teamsApiService.deleteTeam(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
      setTeamToDelete(undefined);
    },
  });

  const handleCreate = () => {
    setEditingTeam(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.reset();
    setTeamToDelete(id);
  };

  const handleCloseDeleteDialog = () => {
    setTeamToDelete(undefined);
    deleteMutation.reset();
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTeam(undefined);
  };

  return (
    <div className="space-y-6">
      <TeamList
        teams={teamsPage?.data ?? []}
        total={teamsPage?.total ?? 0}
        query={query}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        onCreate={canEdit ? handleCreate : undefined}
        onEdit={canEdit ? handleEdit : undefined}
        onDelete={canEdit ? handleDelete : undefined}
      />
      {canEdit && (
        <TeamForm
          team={editingTeam}
          isOpen={isFormOpen}
          onClose={handleCloseForm}
        />
      )}
      <ConfirmDialog
        isOpen={teamToDelete !== undefined}
        onClose={handleCloseDeleteDialog}
        onConfirm={() => teamToDelete !== undefined && deleteMutation.mutate(teamToDelete)}
        title={`${common("delete")} ${common("team")}`}
        description={common("confirm")}
        confirmText={common("delete")}
        cancelText={common("cancel")}
        isLoading={deleteMutation.isPending}
        error={
          deleteMutation.isError
            ? deleteMutation.error instanceof Error
              ? deleteMutation.error.message
              : common("loadError")
            : null
        }
      />
    </div>
  );
};
