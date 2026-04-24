import { newUserSchema, RoleEnum, roleSchema } from "@/lib/domain/users";
import { hashPassword } from "@/lib/services/auth/auth.utils";
import { userService } from "@/lib/services/users";
import type { APIContext } from "astro";

export async function POST({ request }: APIContext) {
  // NOTE: Disable this route when a root user has been created. It is
  // protected if a root already exists but it's better to disable it
  // completely.
  const token = request.headers.get("x-bootstrap-token");
  const bootstrap_token = process.env.BOOTSTRAP_TOKEN;
  if (!bootstrap_token)
    return new Response(JSON.stringify("Bootstrap disabled"), { status: 403 });
  if (token !== bootstrap_token)
    return new Response(JSON.stringify("Invalid bootstrap_token"), {
      status: 403,
    });
  try {
    const data = await request.json();
    const newRoot = newUserSchema
      .extend({ role: roleSchema.extract([RoleEnum.root]) })
      .parse({ ...data, role: RoleEnum.root });
    const [rootExists, hashedPassword] = await Promise.all([
      userService.rootExists(),
      hashPassword(newRoot.password),
    ]);
    if (rootExists)
      return new Response(JSON.stringify("Root already exists"), {
        status: 409,
      });
    newRoot.password = hashedPassword;
    const root = await userService.createUser(newRoot);
    return new Response(JSON.stringify(root), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify(err));
  }
}
