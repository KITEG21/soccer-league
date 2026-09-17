"use client";

import { useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { Season } from "../types";
import { seasonsApiService } from "../services/api";
import { SEASON_FILTERS, SeasonList } from "../components/SeasonList";
import { SeasonForm } from "../components/SeasonForm";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { useListQuery } from "@/shared/components/data-table";
import { usePermission } from "@/shared/hooks/use-permission";

const MAX_SEASONS = 100;

export const SeasonContainer = () => {
  const canEdit = usePermission("seasons:write");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | undefined>();
  const [seasonToDelete, setSeasonToDelete] = useState<number | undefined>();
  const queryClient = useQueryClient();
  const query = useListQuery({ filters: SEASON_FILTERS });

  const { limit, offset, ...criteria } = query.apiParams;
  const seasonsParams = { ...criteria, limit: MAX_SEASONS };

  const {
    data: seasons = [],
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["seasons", "list", seasonsParams],
    queryFn: () => seasonsApiService.getSeasons(seasonsParams),
    placeholderData: keepPreviousData,
  });

  const pageStart = Number(offset) || 0;
  const pageRows = seasons.slice(pageStart, pageStart + (Number(limit) || query.pageSize));

  const deleteMutation = useMutation({
    mutationFn: (id: number) => seasonsApiService.deleteSeason(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["seasons"] });
      setSeasonToDelete(undefined);
    },
  });

  const handleCreate = () => {
    setEditingSeason(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (season: Season) => {
    setEditingSeason(season);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.reset();
    setSeasonToDelete(id);
  };

  const handleCloseDeleteDialog = () => {
    setSeasonToDelete(undefined);
    deleteMutation.reset();
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSeason(undefined);
  };

  return (
    <div className="space-y-6">
      <SeasonList
        seasons={pageRows}
        total={seasons.length}
        query={query}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        onCreate={canEdit ? handleCreate : undefined}
        onEdit={canEdit ? handleEdit : undefined}
        onDelete={canEdit ? handleDelete : undefined}
      />
      {canEdit && (
        <SeasonForm
          season={editingSeason}
          isOpen={isFormOpen}
          onClose={handleCloseForm}
        />
      )}
      <ConfirmDialog
        isOpen={seasonToDelete !== undefined}
        onClose={handleCloseDeleteDialog}
        onConfirm={() => seasonToDelete !== undefined && deleteMutation.mutate(seasonToDelete)}
        title="Eliminar Temporada"
        description="¿Estás seguro de que quieres eliminar esta temporada? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        isLoading={deleteMutation.isPending}
        error={
          deleteMutation.isError
            ? deleteMutation.error instanceof Error
              ? deleteMutation.error.message
              : "Error al eliminar"
            : null
        }
      />
    </div>
  );
};
