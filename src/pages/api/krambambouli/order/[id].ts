import type { APIContext } from "astro";

export async function PATCH({ request }: APIContext) {
  try {
    const payload = await request.json();
    console.log("payload");
    console.log(payload);
    return new Response();
  } catch (e) {
    console.error(e);
    return new Response(null, { status: 500 });
  }
}
