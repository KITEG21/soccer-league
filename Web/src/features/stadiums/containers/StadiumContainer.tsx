import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Stadium } from "../types";
import { stadiumsApiService } from "../services/api";
import { StadiumList } from "../components/StadiumList";
import { StadiumForm } from "../components/StadiumForm";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { BreadcrumbNav } from "@/shared/components/BreadcrumbNav";

export const StadiumContainer = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStadium, setEditingStadium] = useState<Stadium | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stadiumToDelete, setStadiumToDelete] = useState<number | undefined>();

  const queryClient = useQueryClient();

  const {
    data: stadiums = [],
    isLoading,
    error,
  } = useQuery<Stadium[]>({
    queryKey: ["stadiums"],
    queryFn: () => stadiumsApiService.getStadiums(),
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => stadiumsApiService.deleteStadium(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stadiums"] });
      setDeleteDialogOpen(false);
      setStadiumToDelete(undefined);
    },
  });

  const handleCreate = () => {
    setEditingStadium(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (stadium: Stadium) => {
    setEditingStadium(stadium);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    setStadiumToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (stadiumToDelete !== undefined) {
      deleteMutation.mutate(stadiumToDelete);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setStadiumToDelete(undefined);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingStadium(undefined);
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
      <BreadcrumbNav items={[{ label: "Estadios" }]} />
      <StadiumList
        stadiums={stadiums}
        isLoading={isLoading}
        error={error instanceof Error ? error : null}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <StadiumForm
        stadium={editingStadium}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
      />
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Eliminar Estadio"
        description="¿Estás seguro de que quieres eliminar este estadio? Esta acción no se puede deshacer."
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
