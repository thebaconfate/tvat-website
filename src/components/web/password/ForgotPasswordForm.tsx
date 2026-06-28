import { useForm } from "@tanstack/react-form";
import styles from "./ForgotPasswordForm.module.css";
import z4 from "zod/v4";
import Input from "@/components/shared/Input";

export default function ForgotPasswordForm() {
  const form = useForm({
    defaultValues: { email: "" },
    validators: {
      onSubmit: z4.object({
        email: z4.email(),
      }),
    },
  });
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className={styles.form}
      >
        <h1 className={styles.h1}>Forgot password</h1>
        <form.Field name="email">
          {(field) => (
            <>
              <label htmlFor={field.name}>
                Email
                <Input
                  type="email"
                  id={field.name}
                  name={field.name}
                  onChange={(e) => field.handleChange(e.target.value)}
                  value={field.state.value}
                  required
                />
              </label>
            </>
          )}
        </form.Field>
        <button type="submit">Send Reset Link</button>
      </form>
      <a href="/login">Back to login</a>
    </>
  );
}
