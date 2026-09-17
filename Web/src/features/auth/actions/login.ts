"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { setSessionCookies } from "@/shared/auth/cookies";
import type { TokenPair } from "@/shared/auth/tokens";
import { getApiUrl } from "@/shared/config/api";
import { API_ROUTES } from "@/shared/config/routes";

export interface LoginState {
  readonly error: string | null;
  readonly email: string;
}

const MAX_FIELD_LENGTH = 256;

const readField = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
};

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = readField(formData, "email").trim();
  const password = readField(formData, "password");

  if (!email || !password) {
    return { error: "Introduce tu email y contraseña.", email };
  }
  if (email.length > MAX_FIELD_LENGTH || password.length > MAX_FIELD_LENGTH) {
    return { error: "Credenciales incorrectas. Intenta de nuevo.", email };
  }

  const apiUrl = getApiUrl();
  if (!apiUrl || !process.env.JWT_SECRET) {
    return { error: "El servidor no está configurado correctamente.", email };
  }

  let response: Response;
  try {
    response = await fetch(`${apiUrl}${API_ROUTES.auth.login}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    return { error: "No se pudo contactar con la API.", email };
  }

  if (!response.ok) {
    return { error: "Credenciales incorrectas. Intenta de nuevo.", email };
  }

  const tokens = (await response.json()) as TokenPair;
  setSessionCookies(await cookies(), tokens);

  redirect("/");
}
