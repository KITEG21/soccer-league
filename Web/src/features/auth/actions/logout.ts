"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clearSessionCookies } from "@/shared/auth/cookies";
import { REFRESH_TOKEN_COOKIE } from "@/shared/auth/session";
import { getApiUrl } from "@/shared/config/api";
import { API_ROUTES } from "@/shared/config/routes";

export async function logoutAction() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  const apiUrl = getApiUrl();

  if (apiUrl && refreshToken) {
    await fetch(`${apiUrl}${API_ROUTES.auth.logout}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    }).catch(() => null);
  }

  clearSessionCookies(cookieStore);
  redirect("/login");
}
