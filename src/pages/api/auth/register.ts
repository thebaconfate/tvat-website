import { authService } from "@/lib/services/auth/auth.service";

export const prerender = false;

export async function POST({ request }: { request: Request }) {
  const variable = await authService.authenticate(request.headers);
}
