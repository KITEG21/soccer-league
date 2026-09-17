import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/shared/auth/session";
import { refreshAccessToken, type TokenPair } from "@/shared/auth/tokens";
import { setSessionCookies } from "@/shared/auth/cookies";
import { getApiUrl } from "@/shared/config/api";

const METHODS_WITH_BODY = new Set(["POST", "PUT", "PATCH"]);
const EMPTY_BODY_STATUS = new Set([204, 205, 304]);

async function callApi(target: string, request: NextRequest, accessToken: string) {
  return fetch(target, {
    method: request.method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: METHODS_WITH_BODY.has(request.method)
      ? await request.clone().text()
      : undefined,
    cache: "no-store",
  });
}

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const apiUrl = getApiUrl();
  if (!apiUrl) {
    return NextResponse.json(
      { error: "La URL de la API no está definida en el servidor" },
      { status: 500 },
    );
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!accessToken && !refreshToken) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { path } = await params;
  const target = `${apiUrl}/${path.join("/")}${request.nextUrl.search}`;

  let response: Response;
  let renewedTokens: TokenPair | null = null;
  try {
    response = accessToken
      ? await callApi(target, request, accessToken)
      : new Response(null, { status: 401 });

    if (response.status === 401) {
      const renewed = await refreshAccessToken(refreshToken);
      if (!renewed) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
      renewedTokens = renewed;
      response = await callApi(target, request, renewed.access_token);
    }
  } catch {
    return NextResponse.json(
      { error: "No se pudo contactar con la API" },
      { status: 502 },
    );
  }

  let nextResponse: NextResponse;
  if (EMPTY_BODY_STATUS.has(response.status)) {
    nextResponse = new NextResponse(null, { status: response.status });
  } else {
    const body = await response.text();
    nextResponse = new NextResponse(body || null, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "application/json",
      },
    });
  }

  if (renewedTokens) {
    setSessionCookies(nextResponse.cookies, renewedTokens);
  }

  return nextResponse;
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};
