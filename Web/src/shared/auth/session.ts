const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = SESSION_MAX_AGE_SECONDS;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");

const fromBase64Url = (value: string) => {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
};

const getKey = async () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET no está definida");

  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
};

export const createSessionToken = async (user: string) => {
  const payload = toBase64Url(
    encoder.encode(
      JSON.stringify({
        user,
        exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
      }),
    ),
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    await getKey(),
    encoder.encode(payload),
  );

  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
};

export const verifySessionToken = async (token?: string) => {
  if (!token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  try {
    const isValid = await crypto.subtle.verify(
      "HMAC",
      await getKey(),
      fromBase64Url(signature),
      encoder.encode(payload),
    );
    if (!isValid) return false;

    const { exp } = JSON.parse(decoder.decode(fromBase64Url(payload)));
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
};
