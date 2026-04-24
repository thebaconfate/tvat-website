import { Auth } from "../../../lib/auth/auth";
import Database from "../../../lib/database";
import { z } from "zod/v4";

const unAuthorizedResponse = new Response(null, {
  status: 402,
});

export async function POST({ request }: { request: Request }) {
  const data = await request.json();
  const schema = z.object({
    email: z.email(),
    password: z.string().nonempty(),
  });
  const credentials = schema.parse(data);
  const user = await Database.getInstance().then((db) =>
    db.getUser(credentials.email),
  );
  if (!user) return unAuthorizedResponse;
  const auth = new Auth();
  const authorized = await auth
    .compare(credentials.password, user.password)
    .catch((e: any) => {
      console.error(e);
      return false;
    });
  if (!authorized) return unAuthorizedResponse;
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
}
