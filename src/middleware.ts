import type { APIContext, MiddlewareNext } from "astro";
import { APP_ROUTES, ROUTES } from "./lib/routes";
import { authService } from "./lib/services/auth";

const API_PREFIX = "/api";

/**
 * API routes that can be called without logging in. Every other /api route
 * requires a valid session, so new endpoints are protected by default.
 * Paths are matched exactly (after normalisation), per HTTP method.
 */
const PUBLIC_API_ROUTES: Record<string, string[]> = {
  "/api/krambambouli/order": ["POST"], // the public order form
  "/api/contact": ["POST"],
  "/api/activites": ["GET"],
  "/api/auth/login": ["POST"],
  "/api/auth/authenticate": ["GET"], // only reports whether the caller's own cookie is valid
  "/api/auth/forgot-password": ["POST"],
  "/api/auth/reset-password": ["POST"],
  "/api/auth/passage": ["POST"], // verifies the token it is given itself
  "/api/auth/station": ["POST"], // guarded by BOOTSTRAP_TOKEN
};

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

function isUnder(path: string, prefix: string) {
  return path === prefix || path.startsWith(`${prefix}/`);
}

export async function onRequest(context: APIContext, next: MiddlewareNext) {
  const path = normalizePath(context.url.pathname);
  const isApiRoute = isUnder(path, API_PREFIX);
  const isAppRoute = isUnder(path, APP_ROUTES.APP.url);

  // 1. Public pages, and API routes that are explicitly public.
  if (!isApiRoute && !isAppRoute) return next();
  if (isApiRoute && PUBLIC_API_ROUTES[path]?.includes(context.request.method))
    return next();

  // 2. Everything else requires a valid session.
  const authCookie = context.cookies.get("Authorization")?.value;
  const verifiedToken = authCookie ? authService.verifyToken(authCookie) : false;

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
