import {
  newUserSchema,
  RoleEnum,
  roleSchema,
  userService,
} from "@/lib/services/users";
import type { APIContext } from "astro";

export async function POST({ request }: APIContext) {
  try {
    const data = await request.json();
    const newRoot = newUserSchema
      .extend({ role: roleSchema.extract([RoleEnum.root]) })
      .parse({ ...data, role: RoleEnum.root });
    const root = userService.createUser(newRoot);
    return new Response(JSON.stringify(root), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify(err));
  }
}
