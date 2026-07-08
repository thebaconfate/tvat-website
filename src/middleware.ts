import type { APIContext, MiddlewareNext } from "astro";
import { APP_ROUTES, ROUTES } from "./lib/routes";
import { authService } from "./lib/services/auth";

export async function onRequest(context: APIContext, next: MiddlewareNext) {
  const authCookie = context.cookies.get("Authorization")?.value;
  if (!authCookie && !context.url.pathname.startsWith(APP_ROUTES.APP.url))
    return next();
  console.log(ROUTES.LOGIN.url);
  if (!authCookie) return context.redirect(ROUTES.UNAUTHORIZED.url);
  const verifiedToken = authService.verifyToken(authCookie);
  if (!verifiedToken) {
    context.cookies.delete("Authorization");
    return context.redirect(ROUTES.LOGIN.url);
  }
  context.locals.user = {
    id: verifiedToken.sub,
    role: verifiedToken.role,
  };
  return next();
}
