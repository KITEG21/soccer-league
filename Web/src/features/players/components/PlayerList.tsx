import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { playersApiService } from "../services/api";
import { PlayerForm } from "./PlayerForm";
import type { Player } from "../types";


interface PlayerListProps {
  readonly teamId: number;
  readonly players: Player[];
}

export const PlayerList = ({ teamId, players }: PlayerListProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<number | undefined>();

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => playersApiService.deletePlayer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", teamId] });
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
        {players.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            No hay jugadores registrados para este equipo.
          </div>
        ) : (
          players.map((player) => (
            <div
              key={player.id}
              className="bg-card border rounded-xl p-4 flex flex-col gap-3 relative group overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {player.number}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{player.name}</h3>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">
                      {player.position}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(player)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(player.id)}
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
                  <p className="font-semibold">{player.years_in_team || 0}</p>
                </div>
              </div>
            </div>
          ))
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
        onClose={() => {
          setDeleteDialogOpen(false);
          deleteMutation.reset();
        }}
        onConfirm={() => playerToDelete && deleteMutation.mutate(playerToDelete)}
        title="Eliminar Jugador"
        description="¿Estás seguro de que quieres eliminar este jugador?"
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

