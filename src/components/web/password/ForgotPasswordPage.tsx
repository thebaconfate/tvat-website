import { useForm } from "@tanstack/react-form";
import styles from "./ForgotPasswordPage.module.css";
import z4 from "zod/v4";

export default function ForgotPasswordPage({}) {
  const from = useForm({
    defaultValues: { email: "" },
    validators: {
      onSubmit: z4.object({
        email: z4.email(),
      }),
    },
  });
  return (
    <main>
      <form>
        <h1>Forgot password</h1>
        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" required />
        <button type="submit">Send Reset Link</button>
      </form>
      <a href="/login">Back to login</a>
    </main>
  );
}
