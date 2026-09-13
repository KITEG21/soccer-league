import { z } from "zod";

export const stadiumSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100, "El nombre no puede exceder 100 caracteres"),
  capacity: z.coerce.number().int("Debe ser un número entero").min(0, "No puede ser negativo").optional(),
});

export type StadiumFormInput = z.input<typeof stadiumSchema>;
export type StadiumFormData = z.output<typeof stadiumSchema>;
