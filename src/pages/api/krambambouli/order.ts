import { z } from "zod";

export const prerender = false;
const formSchema = z;

function containsUserData(form: FormData) {
  return ["firstName", "lastName", "email", "deliveryOption"].every((key) =>
    form.has(key),
  );
}

const badResponse = new Response(null, {
  status: 400,
});
export async function POST({ request }: { request: Request }) {
  console.log(request);
  const formData = await request.formData();
  if (!containsUserData(formData)) return badResponse;
  const userDetails = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    deliveryOption: formData.get("deliveryOption"),
  };
  console.log(userDetails);
  console.log(formData);
  return new Response();
}
