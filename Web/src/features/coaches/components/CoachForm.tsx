import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Coach } from "../types";
import { coachSchema, type CoachFormData } from "../schemas/coachSchema";
import { coachesApiService } from "../services/api";
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

interface CoachFormProps {
  readonly teamId: number;
  readonly coach?: Coach;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const CoachForm = ({ teamId, coach, isOpen, onClose }: CoachFormProps) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit: handleFormSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CoachFormData>({
    resolver: zodResolver(coachSchema),
    defaultValues: {
      name: "",
      number: 0,
      years_in_team: 0,
      experience_years: 0,
      championships_won: 0,
    },
  });

  useEffect(() => {
    if (coach) {
      reset({
        name: coach.name,
        number: coach.number || 0,
        years_in_team: coach.years_in_team || 0,
        experience_years: coach.experience_years || 0,
        championships_won: coach.championships_won || 0,
      });
    } else {
      reset({
        name: "",
        number: 0,
        years_in_team: 0,
        experience_years: 0,
        championships_won: 0,
      });
    }
  }, [coach, isOpen, reset]);

  const createMutation = useMutation({
    mutationFn: (data: CoachFormData) => 
      coachesApiService.createCoach({ ...data, team_id: teamId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      onClose();
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; coach: CoachFormData }) =>
      coachesApiService.updateCoach(data.id, { ...data.coach, team_id: teamId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      onClose();
      reset();
    },
  });

  const onSubmit = (data: CoachFormData) => {
    if (coach) {
      updateMutation.mutate({
        id: coach.id,
        coach: data,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{coach ? "Editar Entrenador" : "Nuevo Entrenador"}</DialogTitle>
          <DialogDescription>
            {coach
              ? "Edita la información del entrenador."
              : "Completa el formulario para asignar un nuevo entrenador."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coach-name">Nombre *</Label>
            <Input id="coach-name" {...register("name")} disabled={isLoading} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
            {createMutation.error instanceof ApiError && createMutation.error.errors.name && (
              <p className="text-sm text-destructive">{createMutation.error.errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="coach-number">Número</Label>
              <Input
                id="coach-number"
                type="number"
                min="0"
                {...register("number", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {createMutation.error instanceof ApiError && createMutation.error.errors.number && (
                <p className="text-sm text-destructive">{createMutation.error.errors.number}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="coach-years">Años en Equipo</Label>
              <Input
                id="coach-years"
                type="number"
                min="0"
                {...register("years_in_team", { valueAsNumber: true })}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="coach-experience">Años de Experiencia</Label>
              <Input
                id="coach-experience"
                type="number"
                min="0"
                {...register("experience_years", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.experience_years && (
                <p className="text-sm text-destructive">{errors.experience_years.message}</p>
              )}
              {createMutation.error instanceof ApiError && createMutation.error.errors.experience_years && (
                <p className="text-sm text-destructive">{createMutation.error.errors.experience_years}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="coach-won">Campeonatos Ganados</Label>
              <Input
                id="coach-won"
                type="number"
                min="0"
                {...register("championships_won", { valueAsNumber: true })}
                disabled={isLoading}
              />
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
              {isLoading ? "Guardando..." : coach ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
