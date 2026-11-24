import { credentialsSchema } from "@/lib/domain/auth";
import styles from "./LoginForm.module.css";
import { useForm } from "@tanstack/react-form";
import { Mail } from "lucide-react";
import { Button } from "@/components/shared/Button";
import Field from "@/components/shared/Field";
import Input from "@/components/shared/Input";
import PasswordInput from "@/components/shared/PasswordInput";
import { API_ROUTES, APP_ROUTES } from "@/lib/routes";
import { navigate } from "astro:transitions/client";

export default function LoginForm() {
  const form = useForm({
    defaultValues: {
      password: "",
      email: "",
    },
    validators: { onSubmit: credentialsSchema },
    onSubmit: async ({ value }) => {
      const endpoint = API_ROUTES.AUTH.LOGIN.url;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });
      if (response.ok) {
        navigate(APP_ROUTES.APP.url);
      }
    },
  });

  return (
    <div className={styles.formContainer}>
      <form
        method="POST"
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        {/* TODO: give login and forgot/reset password the same title size (h2 here, h1 there). */}
        <h2 className={styles.formTitle}>Inloggen</h2>
        <form.Field name="email">
          {(field) => (
            <Field label="E-mailadres" hideLabel>
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
        <form.Field name="password">
          {(field) => (
            <Field label="Wachtwoord" hideLabel>
              <PasswordInput
                id={field.name}
                name={field.name}
                value={field.state.value}
                placeholder="password"
                required
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                autoComplete="current-password"
              />
            </Field>
          )}
        </form.Field>
        <form.Subscribe selector={(state) => state.errors}>
          {(errors) =>
            errors.length > 0 && (
              <div className={styles.errorContainer}>
                <em className={styles.errorMessage} role="alert">
                  Invalid credentials
                </em>
              </div>
            )
          }
        </form.Subscribe>
        <a className={styles.forgotPasswordLink} href="/forgot-password">
          forgot password?
        </a>
        <Button>Inloggen</Button>
      </form>
    </div>
  );
}
