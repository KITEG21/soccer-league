import { z } from "zod";

export const matchSchema = z.object({
  home_team_id: z.coerce.number().min(1, "El equipo local es requerido"),
  away_team_id: z.coerce.number().min(1, "El equipo visitante es requerido"),
  season_id: z.coerce.number().min(1, "La temporada es requerida"),
  stadium_id: z.coerce.number().min(1, "El estadio es requerido"),
  match_date: z.date({
    message: "Fecha inválida",
  }),
  home_goals: z.coerce.number().int().min(0, "No puede ser negativo"),
  away_goals: z.coerce.number().int().min(0, "No puede ser negativo"),
  attendance: z.coerce.number().int().min(0, "No puede ser negativo").optional(),
}).refine(data => data.home_team_id !== data.away_team_id, {
  message: "El equipo local y el visitante no pueden ser el mismo",
  path: ["away_team_id"],
});

export type MatchFormData = z.infer<typeof matchSchema>;
