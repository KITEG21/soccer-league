import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
} from "@/shared/auth/session";
import type { TokenPair } from "@/shared/auth/tokens";
import { parsePermissions } from "@/shared/auth/permissions";
import { getApiUrl } from "@/shared/config/api";
import { API_ROUTES } from "@/shared/config/routes";

export async function POST(request: Request) {
  const apiUrl = getApiUrl();
  if (!apiUrl || !process.env.JWT_SECRET) {
    return NextResponse.json(
      { error: "Falta la URL de la API o JWT_SECRET en el servidor" },
      { status: 500 },
    );
  }

  let body: { user?: unknown; pass?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida" }, { status: 400 });
  }

  let apiResponse: Response;
  try {
    apiResponse = await fetch(`${apiUrl}${API_ROUTES.auth.login}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(body?.user ?? ""),
        password: String(body?.pass ?? ""),
      }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo contactar con la API" },
      { status: 502 },
    );
  }

  if (!apiResponse.ok) {
    return NextResponse.json(
      { error: "Credenciales incorrectas" },
      { status: 401 },
    );
  }

  const tokens = (await apiResponse.json()) as TokenPair;

  const response = NextResponse.json({
    ok: true,
    role: tokens.role,
    permissions: parsePermissions(tokens.permissions),
  });
  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });

  return response;
}
