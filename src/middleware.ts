import type { APIContext, MiddlewareNext } from "astro";
import { APP_ROUTES, ROUTES } from "./lib/routes";
import { authService } from "./lib/services/auth";

export async function onRequest(context: APIContext, next: MiddlewareNext) {
  const { pathname } = context.url;
  const authCookie = context.cookies.get("Authorization")?.value;

  // 1. Allow public routes (anything outside of protected /app routes)
  const isProtectedRoute = pathname.startsWith(APP_ROUTES.APP.url);
  if (!isProtectedRoute) {
    return next();
  }

  // 2. Reject unauthenticated access to protected routes
  if (!authCookie) {
    return context.redirect(ROUTES.UNAUTHENTICATED.url);
  }

  // 3. Verify cookie token
  const verifiedToken = authService.verifyToken(authCookie);
  if (!verifiedToken) {
    context.cookies.delete("Authorization");
    return context.redirect(ROUTES.LOGIN.url);
  }

  // 4. Attach user context and proceed
  context.locals.user = {
    id: verifiedToken.sub,
    role: verifiedToken.role,
  };

  return next();
}
