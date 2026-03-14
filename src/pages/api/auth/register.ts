export const prerender = false;

export async function POST({ request }: { request: Request }) {
  const token = request.headers.get("cookie");
}
