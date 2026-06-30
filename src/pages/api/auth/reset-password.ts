import { passwordSchema } from "@/lib/domain/users";
import { authService, AuthError } from "@/lib/services/auth";
import type { APIContext } from "astro";
import z4, { ZodError } from "zod/v4";

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
    if (e instanceof ZodError) {
      const firstError = e.issues[0]?.message || "Ongeldige invoergegevens.";
      return new Response(JSON.stringify({ error: firstError }), {
        status: 422, // 422 Unprocessable Entity is standard for validation errors
        headers: { "Content-Type": "application/json" },
      });
    }
    if (e instanceof AuthError) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: e.statusCode,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error(e);
    return new Response(
      JSON.stringify({
        error: "The server encountered an error, contact your administrator",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
