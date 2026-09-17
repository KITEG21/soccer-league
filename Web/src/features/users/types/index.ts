import type { Role } from "@/shared/auth/session";

export type { Role };

export interface User {
  id: number;
  email: string;
  role: Role;
  created_at?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  role: Role;
}

export interface UpdateUserRoleRequest {
  role: Role;
}
