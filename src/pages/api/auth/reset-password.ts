import { passwordSchema } from "@/lib/domain/users";
import { authService } from "@/lib/services/auth";
import type { APIContext } from "astro";
import z4 from "zod/v4";

export async function POST({ request }: APIContext) {
  try {
    const payload = await request.json();
    const validator = z4.object({
      password: passwordSchema,
      token: z4.string(),
    });
    const data = validator.parse(payload);
    await authService.resetPassword(data.password, data.token);
    return new Response();
  } catch (e) {
    console.error(e);
    return new Response(null, { status: 500 });
  }
}
