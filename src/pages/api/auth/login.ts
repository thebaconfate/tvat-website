import { credentialsSchema } from "@/lib/domain/auth";
import { authService } from "@/lib/services/auth";
import type { APIContext } from "astro";

export async function POST({ request, cookies }: APIContext) {
  try {
    const payload = await request.json();
    const credentials = credentialsSchema.parse(payload);
    const jwtToken = await authService.login(credentials);
    if (!jwtToken)
      return new Response(JSON.stringify("Invalid credentials"), {
        headers: { "Content-Type": "application/json" },
        status: 401,
      });
    cookies.set("Authorization", jwtToken, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 3600,
    });
    return new Response(null, { status: 200 });
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify(e), { status: 400 });
  }
}
