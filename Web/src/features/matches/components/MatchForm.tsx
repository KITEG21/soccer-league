import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { AlertCircle } from "lucide-react";

import type { Match } from "../types";
import { matchSchema, type MatchFormData } from "../schemas/matchSchema";
import { matchesApiService } from "../services/api";
import { teamsApiService } from "../../teams/services/api";
import { seasonsApiService } from "../../seasons/services/api";
import { stadiumsApiService } from "../../stadiums/services/api";
import { ApiError } from "@/shared/utils/api-client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { DateTimePicker } from "@/shared/components/ui/date-time-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
// Removed Popover and cn imports as they are now unused in this file

interface MatchFormProps {
  readonly match?: Match;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const MatchForm = ({ match, isOpen, onClose }: MatchFormProps) => {
  const queryClient = useQueryClient();

  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: () => teamsApiService.getTeams(),
    enabled: isOpen,
  });

  const { data: seasons = [] } = useQuery({
    queryKey: ["seasons"],
    queryFn: () => seasonsApiService.getSeasons(),
    enabled: isOpen,
  });

  const { data: stadiums = [] } = useQuery({
    queryKey: ["stadiums"],
    queryFn: () => stadiumsApiService.getStadiums(),
    enabled: isOpen,
  });

  const {
    register,
    handleSubmit: handleFormSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<MatchFormData>({
    resolver: zodResolver(matchSchema) as any,
  });

  const selectedSeasonId = watch("season_id");
  const selectedStadiumId = watch("stadium_id");
  const selectedSeason = seasons.find((s) => s.id === selectedSeasonId);
  const selectedStadium = stadiums.find((st) => st.id === selectedStadiumId);

  useEffect(() => {
    if (match) {
      reset({
        home_team_id: match.home_team_id,
        away_team_id: match.away_team_id,
        season_id: match.season_id,
        stadium_id: match.stadium_id,
        match_date: new Date(match.match_date),
        home_goals: match.home_goals,
        away_goals: match.away_goals,
        attendance: match.attendance,
      });
    } else {
      reset({
        home_team_id: 0,
        away_team_id: 0,
        season_id: 0,
        stadium_id: 0,
        match_date: undefined as any,
        home_goals: 0,
        away_goals: 0,
        attendance: 0,
      });
    }
  }, [match, isOpen, reset]);

  const createMutation = useMutation({
    mutationFn: (data: MatchFormData) => {
        // Adapt to API: Send only YYYY-MM-DD
        const formattedDate = format(data.match_date, "yyyy-MM-dd");
        return matchesApiService.createMatch({
            ...data,
            match_date: formattedDate
        } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      onClose();
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; match: MatchFormData }) => {
        const formattedDate = format(data.match.match_date, "yyyy-MM-dd");
        return matchesApiService.updateMatch(data.id, {
            ...data.match,
            match_date: formattedDate
        } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      onClose();
      reset();
    },
  });

  const onSubmit = (data: MatchFormData) => {
    if (match) {
      updateMutation.mutate({
        id: match.id,
        match: data,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const getErrorMessage = (error: unknown) => {
    if (error instanceof ApiError) return error.message;
    if (error instanceof Error) return error.message;
    return null;
  };

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{match ? "Editar Partido" : "Nuevo Partido"}</DialogTitle>
          <DialogDescription>
            {match
              ? "Edita la información del partido."
              : "Completa el formulario para registrar un nuevo partido."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Equipo Local *</Label>
              <Select
                value={watch("home_team_id")?.toString() || ""}
                onValueChange={(v) => setValue("home_team_id", parseInt(v), { shouldValidate: true })}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={teams.length > 0 ? "Seleccionar equipo" : "Sin equipos"} />
                </SelectTrigger>
                <SelectContent>
                  {teams.length === 0 && <SelectItem value="0" disabled>No hay resultados</SelectItem>}
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.home_team_id && (
                <p className="text-sm text-destructive">{errors.home_team_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Equipo Visitante *</Label>
              <Select
                value={watch("away_team_id")?.toString() || ""}
                onValueChange={(v) => setValue("away_team_id", parseInt(v), { shouldValidate: true })}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={teams.length > 0 ? "Seleccionar equipo" : "Sin equipos"} />
                </SelectTrigger>
                <SelectContent>
                  {teams.length === 0 && <SelectItem value="0" disabled>No hay resultados</SelectItem>}
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.away_team_id && (
                <p className="text-sm text-destructive">{errors.away_team_id.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Temporada *</Label>
              <Select
                value={watch("season_id")?.toString() || ""}
                onValueChange={(v) => {
                    setValue("season_id", parseInt(v), { shouldValidate: true });
                    setValue("match_date", undefined as any);
                }}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={seasons.length > 0 ? "Seleccionar temporada" : "Sin temporadas"} />
                </SelectTrigger>
                <SelectContent>
                  {seasons.length === 0 && <SelectItem value="0" disabled>No hay resultados</SelectItem>}
                  {seasons.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.start_date && s.end_date ? `${format(new Date(s.start_date), "dd/MM/yyyy")} - ${format(new Date(s.end_date), "dd/MM/yyyy")}` : `Temporada ${s.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.season_id && (
                <p className="text-sm text-destructive">{errors.season_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Estadio *</Label>
              <Select
                value={watch("stadium_id")?.toString() || ""}
                onValueChange={(v) => {
                    setValue("stadium_id", parseInt(v), { shouldValidate: true });
                    const st = stadiums.find(s => s.id === parseInt(v));
                    const currentAttendance = watch("attendance") || 0;
                    if (st && currentAttendance > (st.capacity || 0)) {
                        setValue("attendance", st.capacity);
                    }
                }}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={stadiums.length > 0 ? "Seleccionar estadio" : "Sin estadios"} />
                </SelectTrigger>
                <SelectContent>
                  {stadiums.length === 0 && <SelectItem value="0" disabled>No hay resultados</SelectItem>}
                  {stadiums.map((st) => (
                    <SelectItem key={st.id} value={st.id.toString()}>
                      {st.name} (Cap: {st.capacity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.stadium_id && (
                <p className="text-sm text-destructive">{errors.stadium_id.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Programación del Encuentro *</Label>
            {!selectedSeasonId ? (
                <div className="flex items-center gap-2 p-3 border rounded-xl bg-muted/50 text-muted-foreground text-sm italic">
                    <AlertCircle size={16} />
                    Selecciona una temporada para habilitar la fecha y hora
                </div>
            ) : (
                <Controller
                    control={control}
                    name="match_date"
                    render={({ field }) => (
                        <DateTimePicker 
                            date={field.value} 
                            setDate={field.onChange}
                            minDate={selectedSeason?.start_date ? new Date(selectedSeason.start_date) : undefined}
                            maxDate={selectedSeason?.end_date ? new Date(selectedSeason.end_date) : undefined}
                            disabled={isLoading}
                        />
                    )}
                />
            )}
            {errors.match_date && (
              <p className="text-sm text-destructive font-medium flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.match_date.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="home_goals">Goles Local</Label>
              <Input
                id="home_goals"
                type="number"
                min="0"
                {...register("home_goals")}
                disabled={isLoading}
                className="rounded-xl h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="away_goals">Goles Visitante</Label>
              <Input
                id="away_goals"
                type="number"
                min="0"
                {...register("away_goals")}
                disabled={isLoading}
                className="rounded-xl h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendance">Asistencia</Label>
              <Input
                id="attendance"
                type="number"
                min="0"
                max={selectedStadium?.capacity}
                {...register("attendance", {
                    validate: (val) => {
                        if (!selectedStadiumId) return "Selecciona estadio";
                        const attendanceVal = val || 0;
                        if (selectedStadium && attendanceVal > (selectedStadium.capacity || 0)) {
                            return `Máx ${selectedStadium.capacity}`;
                        }
                        return true;
                    }
                })}
                disabled={isLoading || !selectedStadiumId}
                placeholder={selectedStadium ? `Máx ${selectedStadium.capacity}` : "..."}
                className="rounded-xl h-12"
              />
              {errors.attendance && (
                <p className="text-sm text-destructive text-[10px] font-bold">{errors.attendance.message}</p>
              )}
            </div>
          </div>

          {(createMutation.isError || updateMutation.isError) && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {getErrorMessage(createMutation.error || updateMutation.error)}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl h-12 px-6"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-xl h-12 px-8 font-bold">
              {isLoading ? "Guardando..." : match ? "Actualizar Partido" : "Registrar Partido"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
