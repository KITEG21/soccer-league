"use client";

import { useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { Stadium } from "../types";
import { stadiumsApiService } from "../services/api";
import { STADIUM_FILTERS, StadiumList } from "../components/StadiumList";
import { StadiumForm } from "../components/StadiumForm";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { useListQuery } from "@/shared/components/data-table";
import { usePermission } from "@/shared/hooks/use-permission";

export const StadiumContainer = () => {
  const canEdit = usePermission("stadiums:write");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStadium, setEditingStadium] = useState<Stadium | undefined>();
  const [stadiumToDelete, setStadiumToDelete] = useState<number | undefined>();
  const queryClient = useQueryClient();
  const query = useListQuery({ filters: STADIUM_FILTERS });

  const {
    data: stadiumsPage,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["stadiums", "list", query.apiParams],
    queryFn: () => stadiumsApiService.getStadiumsPage(query.apiParams),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => stadiumsApiService.deleteStadium(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["stadiums"] });
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
    deleteMutation.reset();
    setStadiumToDelete(id);
  };

  const handleCloseDeleteDialog = () => {
    setStadiumToDelete(undefined);
    deleteMutation.reset();
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingStadium(undefined);
  };

  return (
    <div className="space-y-6">
      <StadiumList
        stadiums={stadiumsPage?.data ?? []}
        total={stadiumsPage?.total ?? 0}
        query={query}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        onCreate={canEdit ? handleCreate : undefined}
        onEdit={canEdit ? handleEdit : undefined}
        onDelete={canEdit ? handleDelete : undefined}
      />
      {canEdit && (
        <StadiumForm
          stadium={editingStadium}
          isOpen={isFormOpen}
          onClose={handleCloseForm}
        />
      )}
      <ConfirmDialog
        isOpen={stadiumToDelete !== undefined}
        onClose={handleCloseDeleteDialog}
        onConfirm={() => stadiumToDelete !== undefined && deleteMutation.mutate(stadiumToDelete)}
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
