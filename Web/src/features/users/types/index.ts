import type { Role } from "@/shared/auth/session";

export type { Role };

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  created_at?: string;
}

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: Role;
}

export interface UpdateUserRequest {
  first_name: string;
  last_name: string;
  role?: Role;
}
