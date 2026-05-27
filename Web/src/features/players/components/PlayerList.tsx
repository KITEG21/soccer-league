import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Loading } from "@/shared/components/Loading";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { playersApiService } from "../services/api";
import { PlayerForm } from "./PlayerForm";
import type { Player } from "../types";

interface PlayerListProps {
  readonly teamId: number;
}

export const PlayerList = ({ teamId }: PlayerListProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<number | undefined>();

  const queryClient = useQueryClient();

  const {
    data: allPlayers = [],
    isLoading,
    error,
  } = useQuery<Player[]>({
    queryKey: ["players"],
    queryFn: () => playersApiService.getPlayers(),
  });

  const players = allPlayers.filter((p) => p.team_id === teamId);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => playersApiService.deletePlayer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      setDeleteDialogOpen(false);
    },
  });

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    setPlayerToDelete(id);
    setDeleteDialogOpen(true);
  };

  if (isLoading) return <Loading />;
  if (error) return <div className="text-destructive">Error al cargar jugadores</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users className="text-primary" size={20} />
          Jugadores
        </h2>
        <Button size="sm" onClick={() => { setEditingPlayer(undefined); setIsFormOpen(true); }} className="flex gap-2">
          <Plus size={16} />
          Nuevo Jugador
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((player) => (
          <div key={player.id} className="border rounded-lg p-4 bg-card flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold">{player.name}</p>
                <p className="text-xs text-primary font-medium uppercase">{player.position}</p>
              </div>
              <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded">
                #{player.number}
              </span>
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1 mb-4 grid grid-cols-2 gap-x-2">
              <p><span className="font-medium text-foreground/80">Años en equipo:</span> {player.years_in_team || 0}</p>
              <p><span className="font-medium text-foreground/80">Partidos:</span> {player.matches_played || 0}</p>
              <p className="col-span-2"><span className="font-medium text-foreground/80">Goles promedio:</span> {player.average_goals_per_match || 0}</p>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t">
              <Button variant="ghost" size="sm" onClick={() => handleEdit(player)}>
                <Edit size={14} />
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(player.id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
        {players.length === 0 && (
          <p className="text-muted-foreground text-sm italic col-span-full text-center py-4">No hay jugadores registrados para este equipo.</p>
        )}
      </div>

      <PlayerForm
        teamId={teamId}
        player={editingPlayer}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => playerToDelete && deleteMutation.mutate(playerToDelete)}
        title="Eliminar Jugador"
        description="¿Estás seguro de que quieres eliminar este jugador?"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
