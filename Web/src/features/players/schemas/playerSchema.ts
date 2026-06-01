import { z } from "zod";

export const playerSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  number: z.number().min(0, "El número no puede ser menor a 0").optional(),
  years_in_team: z.number().min(0, "Los años en el equipo no pueden ser menores a 0").optional(),
  position: z.string().min(1, "La posición es requerida"),
});

export type PlayerFormData = z.infer<typeof playerSchema>;
