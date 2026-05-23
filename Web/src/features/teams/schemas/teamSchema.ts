import { z } from "zod";

export const teamSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100, "El nombre no puede exceder 100 caracteres"),
  province: z.string().max(100, "La provincia no puede exceder 100 caracteres").optional(),
  mascot: z.string().max(100, "La mascota no puede exceder 100 caracteres").optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color inválido").optional().or(z.literal("")),
  championships_played: z.number().int("Debe ser un número entero").min(0, "No puede ser negativo").optional(),
  championships_won: z.number().int("Debe ser un número entero").min(0, "No puede ser negativo").optional(),
});

export type TeamFormData = z.infer<typeof teamSchema>;
