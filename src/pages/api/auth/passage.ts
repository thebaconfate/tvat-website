import { Auth } from "../../../lib/auth/auth";

export const prerender = false;
const unAuthorizedResponse = new Response(null, {
  status: 401,
});
export async function POST({ request }: { request: Request }) {
  const headers = request.headers;
  const token = headers.get("Authorization");
  if (!token) return unAuthorizedResponse;
  const auth = new Auth();
  return auth
    .verifyToken(token)
    .then((result) => new Response(null, { status: result ? 200 : 401 }));
}
