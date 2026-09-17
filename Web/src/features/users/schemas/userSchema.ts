import { z } from "zod";

const roleSchema = z.enum(["superadmin", "admin", "visitante"]);

export const createUserSchema = z.object({
  email: z.string().min(1, "El email es requerido").email("Email inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(72, "La contraseña no puede superar los 72 caracteres"),
  role: roleSchema,
});

export const updateUserRoleSchema = z.object({
  role: roleSchema,
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserRoleFormData = z.infer<typeof updateUserRoleSchema>;
