import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Team } from "../types";
import { teamSchema, type TeamFormData } from "../schemas/teamSchema";
import { teamsApiService } from "../services/api";
import { ApiError } from "@/shared/utils/api-client";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface TeamFormProps {
  readonly team?: Team;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const TeamForm = ({ team, isOpen, onClose }: TeamFormProps) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit: handleFormSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      province: "",
      mascot: "",
      color: "",
      championships_played: 0,
      championships_won: 0,
    },
  });

  useEffect(() => {
    if (team) {
      reset({
        name: team.name,
        province: team.province || "",
        mascot: team.mascot || "",
        color: team.color || "",
        championships_played: team.championships_played || 0,
        championships_won: team.championships_won || 0,
      });
    } else {
      reset({
        name: "",
        province: "",
        mascot: "",
        color: "",
        championships_played: 0,
        championships_won: 0,
      });
    }
  }, [team, isOpen, reset]);

  const createMutation = useMutation({
    mutationFn: (data: TeamFormData) => teamsApiService.createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      onClose();
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; team: TeamFormData }) =>
      teamsApiService.updateTeam(data.id, data.team),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      onClose();
      reset();
    },
  });

  const onSubmit = (data: TeamFormData) => {
    if (team) {
      updateMutation.mutate({
        id: team.id,
        team: data,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading =
    isSubmitting || createMutation.isPending || updateMutation.isPending;

  const getErrorMessage = (error: unknown) => {
    if (error instanceof ApiError) return error.message;
    if (error instanceof Error) return error.message;
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{team ? "Editar Equipo" : "Nuevo Equipo"}</DialogTitle>
          <DialogDescription>
            {team
              ? "Edita la información del equipo."
              : "Completa el formulario para crear un nuevo equipo."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" {...register("name")} disabled={isLoading} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="province">Provincia</Label>
            <Input
              id="province"
              {...register("province")}
              disabled={isLoading}
            />
            {errors.province && (
              <p className="text-sm text-destructive">
                {errors.province.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mascot">Mascota</Label>
            <Input id="mascot" {...register("mascot")} disabled={isLoading} />
            {errors.mascot && (
              <p className="text-sm text-destructive">
                {errors.mascot.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              type="color"
              {...register("color")}
              disabled={isLoading}
              defaultValue="#000000"
            />
            {errors.color && (
              <p className="text-sm text-destructive">{errors.color.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="championships_played">Campeonatos Jugados</Label>
              <Input
                id="championships_played"
                type="number"
                min="0"
                {...register("championships_played", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.championships_played && (
                <p className="text-sm text-destructive">
                  {errors.championships_played.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="championships_won">Campeonatos Ganados</Label>
              <Input
                id="championships_won"
                type="number"
                min="0"
                {...register("championships_won", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.championships_won && (
                <p className="text-sm text-destructive">
                  {errors.championships_won.message}
                </p>
              )}
            </div>
          </div>

          {(createMutation.isError || updateMutation.isError) && (
            <p className="text-sm text-destructive font-medium">
              {getErrorMessage(createMutation.error || updateMutation.error)}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : team ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
