import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/shared/auth/session";

const METHODS_WITH_BODY = new Set(["POST", "PUT", "PATCH"]);
const EMPTY_BODY_STATUS = new Set([204, 205, 304]);

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    return NextResponse.json(
      { error: "API_URL no está definida en el servidor" },
      { status: 500 },
    );
  }

  const isAuthenticated = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  if (!isAuthenticated) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { path } = await params;
  const target = `${apiUrl}/${path.join("/")}${request.nextUrl.search}`;

  let response: Response;
  try {
    response = await fetch(target, {
      method: request.method,
      headers: { "Content-Type": "application/json" },
      body: METHODS_WITH_BODY.has(request.method)
        ? await request.text()
        : undefined,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo contactar con la API" },
      { status: 502 },
    );
  }

  if (EMPTY_BODY_STATUS.has(response.status)) {
    return new NextResponse(null, { status: response.status });
  }

  const body = await response.text();
  return new NextResponse(body || null, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("content-type") ?? "application/json",
    },
  });
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};
