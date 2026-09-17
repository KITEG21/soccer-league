export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";
export const ACCESS_TOKEN_MAX_AGE = 60 * 15; // 15 minutos, debe calzar con el TTL emitido por la API Go
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

import { parsePermissions, type Permission } from "./permissions";

export type Role = "superadmin" | "admin" | "visitante";

export interface SessionClaims {
  readonly sub: number;
  readonly email: string;
  readonly role: Role;
  readonly permissions: readonly Permission[];
  readonly exp: number;
}

const encoder = new TextEncoder();

const fromBase64Url = (value: string) => {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
};

const getKey = async () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET no está definida");

  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
};

/**
 * Verifica un access token JWT (HS256) emitido por la API Go. No crea tokens:
 * la emisión vive en el backend, este frontend solo comprueba la firma y la expiración.
 */
export const verifyAccessToken = async (
  token?: string,
): Promise<SessionClaims | null> => {
  if (!token) return null;

  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;

  try {
    const isValid = await crypto.subtle.verify(
      "HMAC",
      await getKey(),
      fromBase64Url(signature),
      encoder.encode(`${header}.${payload}`),
    );
    if (!isValid) return null;

    const claims = JSON.parse(
      new TextDecoder().decode(fromBase64Url(payload)),
    ) as Partial<SessionClaims>;

    if (
      typeof claims.exp !== "number" ||
      claims.exp * 1000 <= Date.now() ||
      typeof claims.role !== "string" ||
      typeof claims.email !== "string"
    ) {
      return null;
    }

    return {
      ...claims,
      permissions: parsePermissions(claims.permissions),
    } as SessionClaims;
  } catch {
    return null;
  }
};
