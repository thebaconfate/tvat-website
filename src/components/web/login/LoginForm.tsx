import { credentialsSchema } from "@/lib/domain/auth";
import styles from "./LoginForm.module.css";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Eye, EyeClosed, Mail } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { API_ROUTES, ROUTES } from "@/lib/routes";

export default function LoginForm() {
  const [visible, setVisible] = useState(false);
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
      console.log(response.ok);
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
        <h2 className={styles.formTitle}>Inloggen</h2>
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
        <form.Field name="password">
          {(field) => (
            <div className={styles.inputContainer}>
              <input
                type={visible ? "text" : "password"}
                id={field.name}
                name={field.name}
                value={field.state.value}
                placeholder="password"
                required
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                autoComplete="current-password"
              />
              <button
                className={styles.inputIcon}
                type="button"
                onClick={() => setVisible((v) => !v)}
              >
                {visible ? <Eye /> : <EyeClosed />}
              </button>
            </div>
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
