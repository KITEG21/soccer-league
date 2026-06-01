import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Match } from "../types";
import { matchesApiService } from "../services/api";
import { teamsApiService } from "../../teams/services/api";
import { stadiumsApiService } from "../../stadiums/services/api";
import { MatchList } from "../components/MatchList";
import { MatchForm } from "../components/MatchForm";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { BreadcrumbNav } from "@/shared/components/BreadcrumbNav";

export const MatchContainer = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<number | undefined>();

  const queryClient = useQueryClient();

  const {
    data: matches = [],
    isLoading,
    error,
  } = useQuery<Match[]>({
    queryKey: ["matches"],
    queryFn: () => matchesApiService.getMatches(),
    refetchOnWindowFocus: false,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: () => teamsApiService.getTeams(),
    refetchOnWindowFocus: false,
  });

  const { data: stadiums = [] } = useQuery({
    queryKey: ["stadiums"],
    queryFn: () => stadiumsApiService.getStadiums(),
    refetchOnWindowFocus: false,
  });

  const matchesWithNames = matches.map((match) => ({
    ...match,
    home_team: match.home_team || teams.find((t) => t.id === match.home_team_id),
    away_team: match.away_team || teams.find((t) => t.id === match.away_team_id),
    stadium: match.stadium || stadiums.find((s) => s.id === match.stadium_id),
  }));

  const deleteMutation = useMutation({
    mutationFn: (id: number) => matchesApiService.deleteMatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      setDeleteDialogOpen(false);
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
    setMatchToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (matchToDelete !== undefined) {
      deleteMutation.mutate(matchToDelete);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setMatchToDelete(undefined);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingMatch(undefined);
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
      <BreadcrumbNav items={[{ label: "Partidos" }]} />
      <MatchList
        matches={matchesWithNames}
        isLoading={isLoading}
        error={error instanceof Error ? error : null}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <MatchForm
        match={editingMatch}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
      />
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Eliminar Partido"
        description="¿Estás seguro de que quieres eliminar este partido? Esta acción no se puede deshacer."
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
