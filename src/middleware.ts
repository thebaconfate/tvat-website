import type { APIContext, MiddlewareNext } from "astro";
import { APP_ROUTES } from "./lib/routes";

export async function onRequest(context: APIContext, next: MiddlewareNext) {
  const token = context.cookies.get("Authorization");
  if (!token && context.url.pathname.startsWith(APP_ROUTES.APP.url))
    return next("/unauthorized");
  return next();
}
