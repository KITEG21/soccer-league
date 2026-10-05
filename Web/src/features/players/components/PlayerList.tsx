import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { RowActions } from "@/shared/components/RowActions";
import { playersApiService } from "../services/api";
import { PlayerForm } from "./PlayerForm";
import type { Player } from "../types";
import { usePermission } from "@/shared/hooks/use-permission";
import { useTranslations } from "next-intl";

interface PlayerListProps {
  readonly teamId: number;
  readonly players: Player[];
  readonly autoCreate?: boolean;
  readonly onFormClose?: () => void;
}

export const PlayerList = ({
  teamId,
  players,
  autoCreate = false,
  onFormClose,
}: PlayerListProps) => {
  const t = useTranslations("TeamDetail");
  const common = useTranslations("Common");
  const lists = useTranslations("Lists");
  const canEdit = usePermission("players:write");
  const [isFormOpen, setIsFormOpen] = useState(autoCreate && canEdit);
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

  const handleCreate = () => {
    setEditingPlayer(undefined);
    setIsFormOpen(true);
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">{t("players")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("playersInSquad", { count: players.length })}
          </p>
        </div>
        {canEdit && (
          <Button size="sm" onClick={handleCreate}>
            <Plus />
            {lists("newPlayer")}
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-16">#</TableHead>
              <TableHead>{common("name")}</TableHead>
              <TableHead>{common("position")}</TableHead>
              <TableHead>{common("yearsInTeam")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  {t("noPlayers")}
                </TableCell>
              </TableRow>
            ) : (
              players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono">
                      {player.number ?? "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell className="text-xs font-semibold uppercase text-primary">
                    {player.position}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {player.years_in_team ?? 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <RowActions
                      onEdit={canEdit ? () => handleEdit(player) : undefined}
                      onDelete={
                        canEdit ? () => handleDelete(player.id) : undefined
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {canEdit && (
        <PlayerForm
          teamId={teamId}
          player={editingPlayer}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            onFormClose?.();
          }}
        />
      )}

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          deleteMutation.reset();
        }}
        onConfirm={() => playerToDelete && deleteMutation.mutate(playerToDelete)}
        title={t("deletePlayer")}
        description={t("deletePlayerDescription")}
        confirmText={common("delete")}
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
