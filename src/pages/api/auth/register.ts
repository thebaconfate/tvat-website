import { authService } from "@/lib/services/auth/auth.service";

export async function POST({ request }: { request: Request }) {
  await authService.authenticate(request.headers);
}
