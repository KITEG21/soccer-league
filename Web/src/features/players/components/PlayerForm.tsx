import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Player } from "../types";
import { playerSchema, type PlayerFormData } from "../schemas/playerSchema";
import { playersApiService } from "../services/api";
import { ApiError } from "@/shared/utils/api-client";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface PlayerFormProps {
  readonly teamId: number;
  readonly player?: Player;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

const POSITIONS = [
  { value: "Portero", label: "Portero" },
  { value: "Defensa", label: "Defensa" },
  { value: "Mediocampo", label: "Mediocampo" },
  { value: "Delantero", label: "Delantero" },
];

export const PlayerForm = ({ teamId, player, isOpen, onClose }: PlayerFormProps) => {
  const queryClient = useQueryClient();

  const {
    register,
    control,
    handleSubmit: handleFormSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      name: "",
      number: 0,
      years_in_team: 0,
      position: "",
    },
  });

  useEffect(() => {
    if (player) {
      reset({
        name: player.name,
        number: player.number || 0,
        years_in_team: player.years_in_team || 0,
        position: player.position,
      });
    } else {
      reset({
        name: "",
        number: 0,
        years_in_team: 0,
        position: "",
      });
    }
  }, [player, isOpen, reset]);

  const createMutation = useMutation({
    mutationFn: (data: PlayerFormData) => 
      playersApiService.createPlayer({ ...data, team_id: teamId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      onClose();
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; player: PlayerFormData }) =>
      playersApiService.updatePlayer(data.id, { ...data.player, team_id: teamId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      onClose();
      reset();
    },
  });

  const onSubmit = (data: PlayerFormData) => {
    if (player) {
      updateMutation.mutate({
        id: player.id,
        player: data,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading =
    isSubmitting || createMutation.isPending || updateMutation.isPending;

  const getErrorMessage = (error: unknown) => {
    if (error instanceof ApiError) {
      return error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{player ? "Editar Jugador" : "Nuevo Jugador"}</DialogTitle>
          <DialogDescription>
            {player
              ? "Edita la información del jugador."
              : "Completa el formulario para inscribir un nuevo jugador."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="player-name">Nombre *</Label>
            <Input id="player-name" {...register("name")} disabled={isLoading} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
            {createMutation.error instanceof ApiError && createMutation.error.errors.name && (
              <p className="text-sm text-destructive">{createMutation.error.errors.name}</p>
            )}
            {updateMutation.error instanceof ApiError && updateMutation.error.errors.name && (
              <p className="text-sm text-destructive">{updateMutation.error.errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="player-number">Número</Label>
              <Input
                id="player-number"
                type="number"
                min="0"
                {...register("number", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.number && (
                <p className="text-sm text-destructive">{errors.number.message}</p>
              )}
              {createMutation.error instanceof ApiError && createMutation.error.errors.number && (
                <p className="text-sm text-destructive">{createMutation.error.errors.number}</p>
              )}
              {updateMutation.error instanceof ApiError && updateMutation.error.errors.number && (
                <p className="text-sm text-destructive">{updateMutation.error.errors.number}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="player-position">Posición *</Label>
              <Controller
                name="position"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map((pos) => (
                        <SelectItem key={pos.value} value={pos.value}>
                          {pos.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.position && (
                <p className="text-sm text-destructive">{errors.position.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="player-years">Años en Equipo</Label>
            <Input
              id="player-years"
              type="number"
              min="0"
              {...register("years_in_team", { valueAsNumber: true })}
              disabled={isLoading}
            />
            {errors.years_in_team && (
              <p className="text-sm text-destructive">{errors.years_in_team.message}</p>
            )}
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
              {isLoading ? "Guardando..." : player ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
