"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
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
import { coachesApiService } from "../services/api";
import { CoachForm } from "./CoachForm";
import type { Coach } from "../types";

interface CoachListProps {
  readonly teamId: number;
  readonly coaches: Coach[];
}

export const CoachList = ({ teamId, coaches }: CoachListProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [coachToDelete, setCoachToDelete] = useState<number | undefined>();

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => coachesApiService.deleteCoach(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", teamId] });
      setDeleteDialogOpen(false);
    },
  });

  const handleCreate = () => {
    setEditingCoach(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (coach: Coach) => {
    setEditingCoach(coach);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    setCoachToDelete(id);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Entrenadores</h2>
          <p className="text-sm text-muted-foreground">
            {coaches.length} asignados
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus />
          Nuevo entrenador
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Nombre</TableHead>
              <TableHead>Experiencia</TableHead>
              <TableHead>Campeonatos</TableHead>
              <TableHead>Años en equipo</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {coaches.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No hay entrenadores en este equipo
                </TableCell>
              </TableRow>
            ) : (
              coaches.map((coach) => (
                <TableRow key={coach.id}>
                  <TableCell className="font-medium">{coach.name}</TableCell>
                  <TableCell className="tabular-nums">
                    {coach.experience_years ?? 0} años
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {coach.championships_won ?? 0}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {coach.years_in_team ?? 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <RowActions
                      onEdit={() => handleEdit(coach)}
                      onDelete={() => handleDelete(coach.id)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CoachForm
        teamId={teamId}
        coach={editingCoach}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          deleteMutation.reset();
        }}
        onConfirm={() => coachToDelete && deleteMutation.mutate(coachToDelete)}
        title="Eliminar entrenador"
        description="¿Seguro que quieres eliminar este entrenador? Esta acción no se puede deshacer."
        confirmText="Eliminar"
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
