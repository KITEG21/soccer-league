import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Stadium } from "../types";
import { stadiumSchema, type StadiumFormData } from "../schemas/stadiumSchema";
import { stadiumsApiService } from "../services/api";
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

interface StadiumFormProps {
  readonly stadium?: Stadium;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const StadiumForm = ({ stadium, isOpen, onClose }: StadiumFormProps) => {
  const queryClient = useQueryClient();

  const formMethods = useForm<StadiumFormData>({
    resolver: zodResolver(stadiumSchema) as any,
    defaultValues: {
      name: "",
    },
  });

  const {
    register,
    handleSubmit: handleFormSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = formMethods;

  useEffect(() => {
    if (stadium) {
      reset({
        name: stadium.name,
        capacity: stadium.capacity || undefined,
      });
    } else {
      reset({
        name: "",
        capacity: undefined,
      });
    }
  }, [stadium, isOpen, reset]);

  const createMutation = useMutation({
    mutationFn: (data: StadiumFormData) => stadiumsApiService.createStadium(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stadiums"] });
      onClose();
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; stadium: StadiumFormData }) =>
      stadiumsApiService.updateStadium(data.id, data.stadium),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stadiums"] });
      onClose();
      reset();
    },
  });

  const onSubmit = (data: StadiumFormData) => {
    if (stadium) {
      updateMutation.mutate({
        id: stadium.id,
        stadium: data,
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{stadium ? "Editar Estadio" : "Nuevo Estadio"}</DialogTitle>
          <DialogDescription>
            {stadium
              ? "Edita la información del estadio."
              : "Completa el formulario para crear un nuevo estadio."}
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
            <Label htmlFor="capacity">Capacidad</Label>
            <Input
              id="capacity"
              type="number"
              min="0"
              {...register("capacity")}
              disabled={isLoading}
            />
            {errors.capacity && (
              <p className="text-sm text-destructive">
                {errors.capacity.message}
              </p>
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
              {isLoading ? "Guardando..." : stadium ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
