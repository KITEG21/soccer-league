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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coaches.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            No hay entrenadores registrados para este equipo.
          </div>
        ) : (
          coaches.map((coach) => (
            <div
              key={coach.id}
              className="bg-card border rounded-xl p-4 flex flex-col gap-3 relative group overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {coach.number || 0}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{coach.name}</h3>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">
                      Entrenador
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(coach)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(coach.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-muted/50 p-2 rounded-lg">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">
                    Años en equipo
                  </p>
                  <p className="font-semibold">{coach.years_in_team || 0}</p>
                </div>
                <div className="bg-muted/50 p-2 rounded-lg">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">
                    Experiencia
                  </p>
                  <p className="font-semibold">{coach.experience_years || 0} años</p>
                </div>
                <div className="bg-muted/50 p-2 rounded-lg col-span-2">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">
                    Campeonatos ganados
                  </p>
                  <p className="font-semibold">{coach.championships_won || 0}</p>
                </div>
              </div>
            </div>
          ))
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

