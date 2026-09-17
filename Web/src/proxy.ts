import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  verifyAccessToken,
  type SessionClaims,
} from "@/shared/auth/session";
import { refreshAccessToken, type TokenPair } from "@/shared/auth/tokens";
import { clearSessionCookies, setSessionCookies } from "@/shared/auth/cookies";
import { isPublicRoute } from "@/shared/auth/routes";

interface ResolvedSession {
  readonly claims: SessionClaims | null;
  readonly renewedTokens: TokenPair | null;
  readonly hadSession: boolean;
}

const resolveSession = async (request: NextRequest): Promise<ResolvedSession> => {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const hadSession = Boolean(accessToken || refreshToken);

  const claims = await verifyAccessToken(accessToken);
  if (claims || !refreshToken) {
    return { claims, renewedTokens: null, hadSession };
  }

  const renewedTokens = await refreshAccessToken(refreshToken);
  if (!renewedTokens) {
    return { claims: null, renewedTokens: null, hadSession };
  }

  request.cookies.set(ACCESS_TOKEN_COOKIE, renewedTokens.access_token);
  request.cookies.set(REFRESH_TOKEN_COOKIE, renewedTokens.refresh_token);

  return {
    claims: await verifyAccessToken(renewedTokens.access_token),
    renewedTokens,
    hadSession,
  };
};

const redirectTo = (request: NextRequest, pathname: string) => {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = isPublicRoute(pathname);
  const { claims, renewedTokens, hadSession } = await resolveSession(request);

  let response: NextResponse;
  if (!claims && !isPublic) {
    response = redirectTo(request, "/login");
  } else if (claims && isPublic) {
    response = redirectTo(request, "/");
  } else {
    response = NextResponse.next({ request: { headers: request.headers } });
  }

  if (renewedTokens) {
    setSessionCookies(response, renewedTokens);
  } else if (!claims && hadSession) {
    clearSessionCookies(response);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|favicon.svg).*)"],
};
