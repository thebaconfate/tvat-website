import type { APIContext } from "astro";
import z4 from "zod/v4";
import { authService } from "@/lib/services/auth";

export async function POST({ request, site }: APIContext) {
  const rawData = await request.json();
  const validator = z4.object({
    email: z4.email(),
  });
  const data = validator.parse(rawData);
  const email = data.email;
  await authService.forgotPassword(
    email,
    site ? site.origin : new URL(request.url).origin,
  );
  return new Response();
}
