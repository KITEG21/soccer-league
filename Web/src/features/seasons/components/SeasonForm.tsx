import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Season } from "../types";
import { seasonSchema, type SeasonFormValues } from "../schemas/seasonSchema";
import { seasonsApiService } from "../services/api";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/shared/utils/utils";

interface SeasonFormProps {
  readonly season?: Season;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const SeasonForm = ({ season, isOpen, onClose }: SeasonFormProps) => {
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit: handleFormSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SeasonFormValues>({
    resolver: zodResolver(seasonSchema),
    defaultValues: {
      start_date: "",
      end_date: "",
    },
  });

  useEffect(() => {
    if (season) {
      // Ensure we keep the YYYY-MM-DD format without timezone shift
      const formatDateForState = (dateStr?: string) => {
        if (!dateStr) return "";
        const parsed = parseISO(dateStr);
        return isValid(parsed) ? format(parsed, "yyyy-MM-dd") : "";
      };

      reset({
        start_date: formatDateForState(season.start_date),
        end_date: formatDateForState(season.end_date),
      });
    } else {
      reset({
        start_date: "",
        end_date: "",
      });
    }
  }, [season, isOpen, reset]);

  const createMutation = useMutation({
    mutationFn: (data: SeasonFormValues) => seasonsApiService.createSeason(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seasons"] });
      onClose();
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; season: SeasonFormValues }) =>
      seasonsApiService.updateSeason(data.id, data.season),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seasons"] });
      onClose();
      reset();
    },
  });

  const onSubmit = (data: SeasonFormValues) => {
    if (season) {
      updateMutation.mutate({
        id: season.id,
        season: data,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading =
    isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{season ? "Editar Temporada" : "Nueva Temporada"}</DialogTitle>
          <DialogDescription>
            {season
              ? "Edita las fechas de la temporada."
              : "Completa el formulario para crear una nueva temporada."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label>Fecha de Inicio *</Label>
            <Controller
              control={control}
              name="start_date"
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(parseISO(field.value), "PPP", { locale: es })
                      ) : (
                        <span>Selecciona una fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? parseISO(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                      }
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.start_date && (
              <p className="text-sm text-destructive">{errors.start_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Fecha de Fin *</Label>
            <Controller
              control={control}
              name="end_date"
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(parseISO(field.value), "PPP", { locale: es })
                      ) : (
                        <span>Selecciona una fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? parseISO(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                      }
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.end_date && (
              <p className="text-sm text-destructive">{errors.end_date.message}</p>
            )}
          </div>

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
              {isLoading ? "Guardando..." : season ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
