import type { APIContext, MiddlewareNext } from "astro";
import { API_ROUTES, APP_ROUTES, ROUTES } from "./lib/routes";
import { authService } from "./lib/services/auth";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const PUBLIC_API_ROUTES: [{ url: string }, Method[]][] = [
  [API_ROUTES.KRAMBALBOULI.ORDERS, ["POST"]], // the public order form; GET stays protected
  // TODO: remove after 2026-11-30, with src/pages/api/krambambouli/order.ts (old order form URL).
  [{ url: "/api/krambambouli/order" }, ["POST"]],
  [API_ROUTES.CONTACT, ["POST"]],
  [API_ROUTES.ACTIVITIES, ["GET"]],
  [API_ROUTES.ACTIVITIES.SYNC, ["POST"]], // guarded by SYNC_TOKEN (.github/workflows/sync-activities.yml)
  [API_ROUTES.AUTH.LOGIN, ["POST"]],
  [API_ROUTES.AUTH.AUTHENTICATE, ["GET"]], // only reports whether the caller's own cookie is valid
  [API_ROUTES.AUTH.FORGOT_PASSWORD, ["POST"]],
  [API_ROUTES.AUTH.RESET_PASSWORD, ["POST"]],
  [API_ROUTES.AUTH.PASSAGE, ["POST"]], // verifies the token it is given itself
  [API_ROUTES.AUTH.STATION, ["POST"]], // guarded by BOOTSTRAP_TOKEN
];

function normalizePath(pathname: string): string {
  let path = pathname;
  try {
    path = decodeURIComponent(path);
  } catch {}
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

  if (!isApiRoute && !isAppRoute) return next();
  if (
    isApiRoute &&
    publicApiMethods.get(path)?.includes(context.request.method)
  )
    return next();

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

  context.locals.user = {
    id: verifiedToken.sub,
    role: verifiedToken.role,
  };

  return next();
}
