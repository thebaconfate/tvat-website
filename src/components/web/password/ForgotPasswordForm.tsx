import { useForm } from "@tanstack/react-form";
import styles from "./ForgotPasswordForm.module.css";
import z4 from "zod/v4";
import Input from "@/components/shared/Input";
import { Mail } from "lucide-react";
import { Button } from "@/components/shared/Button";

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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className={styles.form}
    >
      <h1 className={styles.formTitle}>Forgot password</h1>
      <form.Field name="email">
        {(field) => (
          <div className={`${styles.inputContainer} ${styles.container}`}>
            <input
              type="email"
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="Email"
              autoComplete="email"
              required
            />
            <div className={styles.inputIcon}>
              <Mail></Mail>
            </div>
          </div>
        )}
      </form.Field>
      <a href="/login">Back to login</a>
      <Button>Send Reset Link</Button>
    </form>
  );
}
