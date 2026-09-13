import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
} from "@/shared/auth/session";

const constantTimeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;

  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
};

export async function POST(request: Request) {
  const adminUser = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASS;

  if (!adminUser || !adminPass || !process.env.AUTH_SECRET) {
    return NextResponse.json(
      { error: "Faltan ADMIN_USER, ADMIN_PASS o AUTH_SECRET en el servidor" },
      { status: 500 },
    );
  }

  let body: { user?: unknown; pass?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida" }, { status: 400 });
  }

  const isValid =
    constantTimeEqual(String(body?.user ?? ""), adminUser) &&
    constantTimeEqual(String(body?.pass ?? ""), adminPass);

  if (!isValid) {
    return NextResponse.json(
      { error: "Credenciales incorrectas" },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, await createSessionToken(adminUser), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return response;
}
