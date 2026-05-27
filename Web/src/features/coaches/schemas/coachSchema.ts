import { z } from "zod";

export const coachSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  number: z.number().min(0, "El número no puede ser menor a 0").optional(),
  years_in_team: z.number().min(0, "Los años en el equipo no pueden ser menores a 0").optional(),
  experience_years: z.number().min(0, "La experiencia no puede ser menor a 0").optional(),
  championships_won: z.number().min(0, "Los campeonatos no pueden ser menores a 0").optional(),
});

export type CoachFormData = z.infer<typeof coachSchema>;
