import { authService } from "@/lib/services/auth";
import type { APIContext } from "astro";

export async function GET({ request }: APIContext) {
  const authenticated = (await authService.authenticate(request.headers))
    ? true
    : false;
  console.log(authenticated);
  return new Response(JSON.stringify(authenticated));
}
