import { Auth } from "../../../lib/auth";
import Database from "../../../lib/database";

export const prerender = false;

const badRequest = new Response(null, { status: 400 });
export async function POST({ request }: { request: Request }) {
  try {
    const payload = await request.json();
    if (!payload.email || !payload.password) return badRequest;
    const db = await Database.getInstance();
    const registrationGuard = await db
      .countUsers()
      .then((count) => count === 0);
    if (!registrationGuard) return badRequest;
    const auth = new Auth();
    const user = {
      email: payload.email as string,
      password: await auth.hash(payload.password),
    };
    await db.saveUser(user.email, user.password);
    return new Response(null, {
      status: 201,
    });
  } catch (e: any) {
    console.error(e);
    return new Response(null, { status: 500 });
  }
}
