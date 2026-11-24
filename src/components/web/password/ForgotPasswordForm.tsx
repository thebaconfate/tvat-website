import { useForm } from "@tanstack/react-form";
import styles from "./ForgotPasswordForm.module.css";
import z4 from "zod/v4";
import { Mail } from "lucide-react";
import { Button } from "@/components/shared/Button";
import Field from "@/components/shared/Field";
import Input from "@/components/shared/Input";
import { useState } from "react";
import { API_ROUTES, ROUTES } from "@/lib/routes";
import { navigate } from "astro/virtual-modules/transitions-router.js";

export default function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const form = useForm({
    defaultValues: { email: "" },
    validators: {
      onSubmit: z4.object({
        email: z4.email(),
      }),
    },
    onSubmit: async ({ value }) => {
      try {
        await fetch(API_ROUTES.AUTH.FORGOT_PASSWORD.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value),
        });
      } catch (e) {
        console.error(e);
      } finally {
        setSubmitted(true);
        setTimeout(() => navigate(ROUTES.LOGIN.url), 1000 * 10);
      }
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
      {/* TODO: give login and forgot/reset password the same title size (h1 here, h2 on login). */}
      <h1 className={styles.formTitle}>Forgot password</h1>
      {!submitted ? (
        <>
          <form.Field name="email">
            {(field) => (
              <Field label="E-mailadres" hideLabel className={styles.field}>
                <Input
                  type="email"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Email"
                  autoComplete="email"
                  required
                  trailing={<Mail aria-hidden="true" className={styles.icon} />}
                />
              </Field>
            )}
          </form.Field>
          <a href="/login">Back to login</a>
          <Button>Send Reset Link</Button>
        </>
      ) : (
        <>
          <p className={styles.submittedText}>
            Als er een account bestaat met dit e-mailadres, hebben we
            instructies gestuurd om je wachtwoord te herstellen. Controleer ook
            je inbox en de map met ongewenste e-mail (spam).
          </p>
          <a href="/login">Back to login</a>
        </>
      )}
    </form>
  );
}
