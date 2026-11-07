import type { APIContext, MiddlewareNext } from "astro";
import { API_ROUTES, APP_ROUTES, ROUTES } from "./lib/routes";
import { authService } from "./lib/services/auth";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * API routes that can be called without logging in. Every other API route
 * requires a valid session, so new endpoints are protected by default.
 * Paths are matched exactly (after normalisation), per HTTP method.
 */
const PUBLIC_API_ROUTES: [{ url: string }, Method[]][] = [
  [API_ROUTES.KRAMBALBOULI.ORDER, ["POST"]], // the public order form
  [API_ROUTES.CONTACT, ["POST"]],
  [API_ROUTES.ACTIVITIES, ["GET"]],
  [API_ROUTES.AUTH.LOGIN, ["POST"]],
  [API_ROUTES.AUTH.AUTHENTICATE, ["GET"]], // only reports whether the caller's own cookie is valid
  [API_ROUTES.AUTH.FORGOT_PASSWORD, ["POST"]],
  [API_ROUTES.AUTH.RESET_PASSWORD, ["POST"]],
  [API_ROUTES.AUTH.PASSAGE, ["POST"]], // verifies the token it is given itself
  [API_ROUTES.AUTH.STATION, ["POST"]], // guarded by BOOTSTRAP_TOKEN
];

/** Lowercase, decode, collapse duplicate slashes and drop trailing slashes. */
function normalizePath(pathname: string): string {
  let path = pathname;
  try {
    path = decodeURIComponent(path);
  } catch {
    // Malformed encoding: keep it as is; it won't match a public route.
  }
  path = path.toLowerCase().replace(/\/{2,}/g, "/");
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

const publicApiMethods = new Map<string, string[]>(
  PUBLIC_API_ROUTES.map(([route, methods]) => [
    normalizePath(route.url),
    methods,
  ]),
);
const apiPrefix = normalizePath(API_ROUTES.url);
const appPrefix = normalizePath(APP_ROUTES.APP.url);

function isUnder(path: string, prefix: string) {
  return path === prefix || path.startsWith(`${prefix}/`);
}

export async function onRequest(context: APIContext, next: MiddlewareNext) {
  const path = normalizePath(context.url.pathname);
  const isApiRoute = isUnder(path, apiPrefix);
  const isAppRoute = isUnder(path, appPrefix);

  // 1. Public pages, and API routes that are explicitly public.
  if (!isApiRoute && !isAppRoute) return next();
  if (
    isApiRoute &&
    publicApiMethods.get(path)?.includes(context.request.method)
  )
    return next();

  // 2. Everything else requires a valid session.
  const authCookie = context.cookies.get("Authorization")?.value;
  const verifiedToken = authCookie
    ? authService.verifyToken(authCookie)
    : false;

  if (!verifiedToken) {
    if (authCookie) context.cookies.delete("Authorization", { path: "/" });
    if (isApiRoute) return new Response(null, { status: 401 });
    return context.redirect(
      authCookie ? ROUTES.LOGIN.url : ROUTES.UNAUTHENTICATED.url,
    );
  }

  // 3. Attach user context and proceed.
  context.locals.user = {
    id: verifiedToken.sub,
    role: verifiedToken.role,
  };

  return next();
}
