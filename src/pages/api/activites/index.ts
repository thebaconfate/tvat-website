import type { APIContext } from "astro";

export async function GET({ request }: APIContext) {
  return new Response();
}
