import bcrypt from "bcrypt";

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function getAuthToken(headers: Headers) {
  const authCookie = headers
    .get("cookie")
    ?.split(";")
    ?.find((cookie) => cookie.trim().startsWith("Authorization="));
  if (!authCookie) return undefined;
  const [_, ...values] = authCookie.split("=");
  return values.join("=");
}

export function setJwtCookie(token: string, headers: Headers = new Headers()) {
  headers.set(
    "Set-Cookie",
    `Authorization=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`,
  );
  return headers;
}
