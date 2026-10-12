import { z } from "zod";

const roleSchema = z.enum(["superadmin", "admin", "visitante"]);
const userNames = {
  first_name: z.string().trim().min(1, "El nombre es requerido").max(100, "El nombre no puede exceder 100 caracteres"),
  last_name: z.string().trim().min(1, "Los apellidos son requeridos").max(100, "Los apellidos no pueden exceder 100 caracteres"),
};

export const createUserSchema = z.object({
  ...userNames,
  email: z.string().min(1, "El email es requerido").email("Email inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(72, "La contraseña no puede superar los 72 caracteres"),
  role: roleSchema,
});

export const updateUserSchema = z.object({
  ...userNames,
  role: roleSchema,
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
