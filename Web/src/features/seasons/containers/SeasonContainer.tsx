import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Season } from "../types";
import { seasonsApiService } from "../services/api";
import { SeasonList } from "../components/SeasonList";
import { SeasonForm } from "../components/SeasonForm";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";

export const SeasonContainer = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [seasonToDelete, setSeasonToDelete] = useState<number | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const queryClient = useQueryClient();

  const {
    data: seasons = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Season[]>({
    queryKey: ["seasons", refreshKey],
    queryFn: () => seasonsApiService.getSeasons(),
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => seasonsApiService.deleteSeason(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["seasons"],
        refetchType: "active",
      });
      await refetch();
      setRefreshKey((prev) => prev + 1);
      setDeleteDialogOpen(false);
      setSeasonToDelete(undefined);
    },
    onError: (error) => {
      console.error("Delete error:", error);
      setDeleteDialogOpen(false);
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
    setSeasonToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (seasonToDelete !== undefined) {
      deleteMutation.mutate(seasonToDelete);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSeasonToDelete(undefined);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSeason(undefined);
  };

  return (
    <>
      <SeasonList
        seasons={seasons}
        isLoading={isLoading}
        error={error}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <SeasonForm
        season={editingSeason}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
      />
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Eliminar Temporada"
        description="¿Estás seguro de que quieres eliminar esta temporada? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};
