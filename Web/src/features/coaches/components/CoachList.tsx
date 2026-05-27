import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, UserCog } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Loading } from "@/shared/components/Loading";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { coachesApiService } from "../services/api";
import { CoachForm } from "./CoachForm";
import type { Coach } from "../types";

interface CoachListProps {
  readonly teamId: number;
}

export const CoachList = ({ teamId }: CoachListProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [coachToDelete, setCoachToDelete] = useState<number | undefined>();

  const queryClient = useQueryClient();

  const {
    data: allCoaches = [],
    isLoading,
    error,
  } = useQuery<Coach[]>({
    queryKey: ["coaches"],
    queryFn: () => coachesApiService.getCoaches(),
  });

  const coaches = allCoaches.filter((c) => c.team_id === teamId);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => coachesApiService.deleteCoach(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      setDeleteDialogOpen(false);
    },
  });

  const handleEdit = (coach: Coach) => {
    setEditingCoach(coach);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    setCoachToDelete(id);
    setDeleteDialogOpen(true);
  };

  if (isLoading) return <Loading />;
  if (error) return <div className="text-destructive">Error al cargar entrenadores</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <UserCog className="text-primary" size={20} />
          Entrenadores
        </h2>
        <Button size="sm" onClick={() => { setEditingCoach(undefined); setIsFormOpen(true); }} className="flex gap-2">
          <Plus size={16} />
          Nuevo Entrenador
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coaches.map((coach) => (
          <div key={coach.id} className="border rounded-lg p-4 bg-card flex justify-between items-center">
            <div>
              <p className="font-semibold text-lg">{coach.name}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                <p><span className="font-medium text-foreground/80">Número:</span> {coach.number || 0}</p>
                <p><span className="font-medium text-foreground/80">Años en equipo:</span> {coach.years_in_team || 0}</p>
                <p><span className="font-medium text-foreground/80">Experiencia:</span> {coach.experience_years || 0} años</p>
                <p><span className="font-medium text-foreground/80">Campeonatos:</span> {coach.championships_won || 0}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleEdit(coach)}>
                <Edit size={14} />
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(coach.id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
        {coaches.length === 0 && (
          <p className="text-muted-foreground text-sm italic col-span-2">No hay entrenadores registrados para este equipo.</p>
        )}
      </div>

      <CoachForm
        teamId={teamId}
        coach={editingCoach}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => coachToDelete && deleteMutation.mutate(coachToDelete)}
        title="Eliminar Entrenador"
        description="¿Estás seguro de que quieres eliminar este entrenador?"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
