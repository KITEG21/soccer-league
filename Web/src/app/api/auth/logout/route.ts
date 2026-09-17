import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { REFRESH_TOKEN_COOKIE } from "@/shared/auth/session";
import { clearSessionCookies } from "@/shared/auth/cookies";
import { getApiUrl } from "@/shared/config/api";
import { API_ROUTES } from "@/shared/config/routes";

export async function POST() {
  const apiUrl = getApiUrl();
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (apiUrl && refreshToken) {
    try {
      await fetch(`${apiUrl}${API_ROUTES.auth.logout}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
        cache: "no-store",
      });
    } catch {
      // si la API no responde, igual cerramos la sesión localmente
    }
  }

  const response = NextResponse.json({ ok: true });
  clearSessionCookies(response.cookies);
  return response;
}
