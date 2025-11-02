import { Auth } from "../../../lib/auth/auth";
import { loginSchema } from "../../../lib/auth/schemas";
import Database from "../../../lib/database";

const unauthorizedResponse = new Response(null, {
  status: 402,
});

export async function POST({ request }: { request: Request }) {
  try {
    const data = await request.json();
    const credentials = loginSchema.parse(data);
    const user = await Database.getInstance().then((db) =>
      db.getUser(credentials.email),
    );
    if (!user) return unauthorizedResponse;
    const auth = new Auth();
    const authorized = await auth
      .compare(credentials.password, user.password)
      .catch((e: any) => {
        console.error(e);
        return false;
      });
    if (!authorized) return unauthorizedResponse;
    const token = await auth.generateToken(user.email);
    const tokenExp = 3600;
    const headers: Headers = new Headers();
    headers.append(
      "Set-Cookie",
      `Authorization=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${tokenExp}; Path=/`,
    );
    return new Response(null, {
      status: 200,
      headers,
    });
  } catch (e: any) {
    console.error(e);
    return new Response(null, { status: 400 });
  }
}
