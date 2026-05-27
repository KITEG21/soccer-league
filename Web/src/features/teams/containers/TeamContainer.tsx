import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Team } from "../types";
import { teamsApiService } from "../services/api";
import { TeamList } from "../components/TeamList";
import { TeamForm } from "../components/TeamForm";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { BreadcrumbNav } from "@/shared/components/BreadcrumbNav";

export const TeamContainer = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<number | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const queryClient = useQueryClient();

  const {
    data: teams = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Team[]>({
    queryKey: ["teams", refreshKey],
    queryFn: () => teamsApiService.getTeams(),
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => teamsApiService.deleteTeam(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["teams"],
        refetchType: "active",
      });
      await refetch();
      setRefreshKey((prev) => prev + 1);
      setDeleteDialogOpen(false);
      setTeamToDelete(undefined);
    },
    onError: (error) => {
      console.error("Delete error:", error);
      setDeleteDialogOpen(false);
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
    setTeamToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (teamToDelete !== undefined) {
      deleteMutation.mutate(teamToDelete);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setTeamToDelete(undefined);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTeam(undefined);
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
      <BreadcrumbNav items={[{ label: "Equipos" }]} />
      <TeamList
        teams={teams}
        isLoading={isLoading}
        error={error}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <TeamForm
        team={editingTeam}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
      />
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Eliminar Equipo"
        description="¿Estás seguro de que quieres eliminar este equipo? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
