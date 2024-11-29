import { Auth } from "../../../lib/auth";
import Database from "../../../lib/db";

export const prerender = false;

interface User {
  id?: number;
  email: string;
  password: string;
}

const unAuthorizedResponse = new Response(null, {
  status: 402,
});

export async function POST({ request }: { request: Request }) {
  const formData = await request.formData();
  if (!formData.has("email") || !formData.has("password"))
    return new Response(null, {
      status: 400,
    });
  const credentials = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
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
