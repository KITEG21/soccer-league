import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
} from "./session";

interface SessionTokens {
  readonly access_token: string;
  readonly refresh_token: string;
}

interface CookieOptions {
  httpOnly: boolean;
  sameSite: "lax";
  secure: boolean;
  path: string;
  maxAge: number;
}

interface CookieWriter {
  set(name: string, value: string, options: CookieOptions): unknown;
  delete(name: string): unknown;
}

const cookieOptions = (maxAge: number): CookieOptions => ({
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge,
});

export const setSessionCookies = (
  cookieStore: CookieWriter,
  tokens: SessionTokens,
) => {
  cookieStore.set(
    ACCESS_TOKEN_COOKIE,
    tokens.access_token,
    cookieOptions(ACCESS_TOKEN_MAX_AGE),
  );
  cookieStore.set(
    REFRESH_TOKEN_COOKIE,
    tokens.refresh_token,
    cookieOptions(REFRESH_TOKEN_MAX_AGE),
  );
};

export const clearSessionCookies = (cookieStore: CookieWriter) => {
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
};
