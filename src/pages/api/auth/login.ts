import { credentialsSchema } from "@/lib/domain/auth";
import { authService } from "@/lib/services/auth";
import { setJwtCookie } from "@/lib/services/auth";

export async function POST({ request }: { request: Request }) {
  try {
    const payload = await request.json();
    const credentials = credentialsSchema.parse(payload);
    const jwtToken = await authService.login(credentials);
    if (!jwtToken)
      return new Response(JSON.stringify("Invalid credentials"), {
        status: 401,
      });
    const headers = setJwtCookie(jwtToken);
    return new Response(null, { headers });
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify(e), { status: 400 });
  }
}
